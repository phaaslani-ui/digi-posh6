/* ═══════════════════════════════════════════════════════════════════
 * 🤖 DP Wardrobe AI v18.2 — ست‌ساز هوشمند با کمد کاربر
 * ------------------------------------------------------------------
 * • آپلود عکس لباس + تحلیل رنگ real-time (Canvas API)
 * • تشخیص رنگ اصلی، فرعی، و الگو از عکس
 * • ساخت ست با لباس‌های کاربر + پیشنهاد محصول واقعی فروشنده
 * • پیشنهاد بر اساس رنگ‌های مکمل، فصل، موقعیت
 * • Real-time در پروفایل
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

(function() {
  if (window.DPWardrobeAI) return;

  // ═══════════════════════════════════════════════════════════════
  // 🎨 تحلیل رنگ از عکس
  // ═══════════════════════════════════════════════════════════════
  const ColorAnalyzer = {
    // استخراج رنگ اصلی از عکس
    async analyze(imageUrl, options = {}) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // سایز کوچک برای سرعت
            const maxSize = 200;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = Math.floor(img.width * ratio);
            canvas.height = Math.floor(img.height * ratio);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // شمارش رنگ‌ها
            const colorMap = {};
            const totalPixels = data.length / 4;
            
            for (let i = 0; i < data.length; i += 16) { // هر ۴ پیکسل یکی
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];
              
              if (a < 128) continue; // شفاف
              
              // کوانتیزه کردن برای گروه‌بندی
              const qr = Math.round(r / 32) * 32;
              const qg = Math.round(g / 32) * 32;
              const qb = Math.round(b / 32) * 32;
              const key = `${qr},${qg},${qb}`;
              colorMap[key] = (colorMap[key] || 0) + 1;
            }
            
            // مرتب‌سازی بر اساس فراوانی
            const sortedColors = Object.entries(colorMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([key, count]) => {
                const [r, g, b] = key.split(',').map(Number);
                return {
                  rgb: { r, g, b },
                  hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''),
                  count: count,
                  percentage: Math.round(count / totalPixels * 100)
                };
              });
            
            // رنگ اصلی = پرفراوانی‌ترین
            const dominant = sortedColors[0];
            // رنگ فرعی = دومی با فاصله مناسب
            const secondary = sortedColors.find(c => 
              this.colorDistance(c.rgb, dominant.rgb) > 50
            ) || sortedColors[1];
            
            // تشخیص نام رنگ
            const dominantName = this.colorToName(dominant.rgb);
            const secondaryName = secondary ? this.colorToName(secondary.rgb) : null;
            
            // تشخیص روشنایی
            const brightness = (dominant.rgb.r + dominant.rgb.g + dominant.rgb.b) / 3;
            const isLight = brightness > 128;
            
            // تشخیص فصل
            const season = this.guessSeason(dominant.rgb, dominantName);
            
            resolve({
              dominant: {
                ...dominant,
                name: dominantName
              },
              secondary: secondary ? {
                ...secondary,
                name: secondaryName
              } : null,
              brightness: Math.round(brightness),
              isLight,
              season,
              allColors: sortedColors,
              totalPixels
            });
          } catch (e) {
            resolve({ error: e.message });
          }
        };
        img.onerror = () => resolve({ error: 'عکس بارگذاری نشد' });
        img.src = imageUrl;
      });
    },

    // فاصله بین دو رنگ
    colorDistance(rgb1, rgb2) {
      return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
      );
    },

    // تبدیل RGB به نام فارسی
    colorToName(rgb) {
      const { r, g, b } = rgb;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      
      // تک‌رنگ (سیاه، سفید، خاکستری)
      if (diff < 30) {
        if (max < 50) return 'مشکی';
        if (max > 220) return 'سفید';
        return 'طوسی';
      }
      
      // رنگی
      if (r > g && r > b) {
        if (g > 100) return 'نارنجی';
        if (b > 100) return 'صورتی';
        return 'قرمز';
      }
      if (g > r && g > b) {
        if (b > 100) return 'فیروزه‌ای';
        return 'سبز';
      }
      if (b > r && b > g) {
        if (r > 100) return 'بنفش';
        return 'آبی';
      }
      if (r > 150 && g > 150) {
        if (b < 100) return 'زرد';
        return 'زیتونی';
      }
      if (r > 150 && b > 150) {
        return 'یاسی';
      }
      if (g > 150 && b > 150) {
        return 'آبی آسمانی';
      }
      
      // رنگ‌های خاص
      if (r > 180 && g > 130 && b < 100) return 'طلایی';
      if (r > 150 && g > 100 && b < 80) return 'مسی';
      if (r > 100 && g < 80 && b < 80) return 'قهوه‌ای';
      if (r > 100 && g > 80 && b < 80) return 'خردلی';
      
      return 'رنگارنگ';
    },

    // تشخیص فصل از رنگ
    guessSeason(rgb, name) {
      const { r, g, b } = rgb;
      const brightness = (r + g + b) / 3;
      
      // زمستان: تیره و سرد
      if (brightness < 80) return 'زمستان';
      // تابستان: روشن و گرم
      if (brightness > 200 && name === 'سفید') return 'تابستان';
      // پاییز: قهوه‌ای، زرد، نارنجی
      if (['قهوه‌ای', 'خردلی', 'مسی', 'نارنجی', 'زیتونی'].includes(name)) return 'پاییز';
      // بهار: رنگ‌های شاد
      if (['صورتی', 'آبی آسمانی', 'سبز', 'زرد'].includes(name)) return 'بهار';
      
      return 'چهار فصل';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🧠 موتور پیشنهاد ست
  // ═══════════════════════════════════════════════════════════════
  const OutfitEngine = {
    // رنگ‌های مکمل
    complementaryColors(colorName) {
      const map = {
        'مشکی': ['سفید', 'قرمز', 'طلایی', 'صورتی', 'آبی آسمانی'],
        'سفید': ['مشکی', 'آبی', 'قرمز', 'صورتی', 'سرمه‌ای', 'سبز'],
        'طوسی': ['صورتی', 'زرشکی', 'آبی', 'زرد', 'سبز'],
        'قرمز': ['مشکی', 'سفید', 'سرمه‌ای', 'طوسی', 'کرم'],
        'آبی': ['سفید', 'کرم', 'صورتی', 'زرد', 'نارنجی'],
        'سرمه‌ای': ['سفید', 'کرم', 'صورتی', 'قهوه‌ای', 'زرد'],
        'سبز': ['کرم', 'قهوه‌ای', 'سفید', 'صورتی', 'مسی'],
        'صورتی': ['مشکی', 'سرمه‌ای', 'خاکستری', 'سفید'],
        'قهوه‌ای': ['کرم', 'سفید', 'سبز', 'آبی آسمانی', 'صورتی'],
        'کرم': ['قهوه‌ای', 'سرمه‌ای', 'سبز', 'زرشکی'],
        'طلایی': ['مشکی', 'سرمه‌ای', 'زرشکی', 'قهوه‌ای']
      };
      return map[colorName] || ['سفید', 'مشکی', 'کرم'];
    },

    // استایل‌های مکمل
    styleSuggestions(colorName, season) {
      const base = {
        'مشکی': ['شیک', 'مدرن', 'مجلسی', 'مینیمال'],
        'سفید': ['مینیمال', 'کلاسیک', 'ساحلی', 'رمانتیک'],
        'قرمز': ['مجلسی', 'رمانتیک', 'شیک', 'جسورانه'],
        'آبی': ['کلاسیک', 'دریایی', 'حرفه‌ای', 'راحت'],
        'سرمه‌ای': ['رسمی', 'حرفه‌ای', 'کلاسیک', 'شیک'],
        'صورتی': ['رمانتیک', 'زنانه', 'شاد', 'ملایم'],
        'سبز': ['طبیعت', 'کلاسیک', 'شیک', 'آرامش‌بخش']
      };
      const suggestions = base[colorName] || ['شیک', 'مدرن'];
      if (season === 'پاییز' || season === 'زمستان') {
        suggestions.push('گرم و صمیمی', 'لایه‌ای');
      } else if (season === 'بهار' || season === 'تابستان') {
        suggestions.push('خنک و راحت', 'ساحلی');
      }
      return suggestions;
    },

    // ساخت ست از کمد کاربر
    buildOutfits(userWardrobe, options = {}) {
      const outfits = [];
      const tops = userWardrobe.filter(i => ['پیراهن', 'تیشرت', 'بلوز', 'کت', 'پالتو', 'تاپ'].includes(i.category));
      const bottoms = userWardrobe.filter(i => ['شلوار', 'دامن', 'پایین تنه'].includes(i.category));
      const shoes = userWardrobe.filter(i => i.category === 'کفش');
      const accessories = userWardrobe.filter(i => i.category === 'اکسسوری');
      
      if (tops.length === 0 || bottoms.length === 0) {
        return {
          empty: true,
          message: 'برای ساخت ست، حداقل یک تاپ و یک شلوار/دامن نیاز دارید. لباس‌هات رو از بخش کمد اضافه کن.'
        };
      }

      // ساخت ۵ ست متنوع
      const usedCombos = new Set();
      let attempts = 0;
      while (outfits.length < 5 && attempts < 30) {
        attempts++;
        const top = tops[Math.floor(Math.random() * tops.length)];
        const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        const shoe = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : null;
        const accessory = accessories.length > 0 ? accessories[Math.floor(Math.random() * accessories.length)] : null;
        
        const comboKey = `${top.id}-${bottom.id}`;
        if (usedCombos.has(comboKey)) continue;
        usedCombos.add(comboKey);
        
        // تحلیل رنگ
        const topColors = top.colors || [top.color].filter(Boolean);
        const bottomColors = bottom.colors || [bottom.color].filter(Boolean);
        const mainColor = topColors[0] || 'نامشخص';
        
        // پیشنهاد رنگ‌های مکمل
        const complementaries = this.complementaryColors(mainColor);
        const matchScore = this.calculateMatch(top, bottom, shoe);
        
        const items = [top, bottom];
        if (shoe) items.push(shoe);
        if (accessory) items.push(accessory);
        
        outfits.push({
          id: 'outfit_' + Date.now().toString(36) + '_' + outfits.length,
          name: this.generateOutfitName(top, bottom),
          items: items,
          mainColor: mainColor,
          complementaries: complementaries.slice(0, 3),
          matchScore: matchScore,
          style: this.styleSuggestions(mainColor, top.season || 'چهار فصل').slice(0, 2),
          reason: this.generateReason(top, bottom, shoe, matchScore),
          occasion: this.guessOccasion(top, bottom)
        });
      }
      
      return { empty: false, outfits };
    },

    // محاسبه امتیاز هماهنگی
    calculateMatch(top, bottom, shoe) {
      let score = 60;
      const topColor = (top.colors || [top.color])[0];
      const bottomColor = (bottom.colors || [bottom.color])[0];
      
      // اگه رنگ‌ها مکمل باشن
      const complements = this.complementaryColors(topColor);
      if (complements.includes(bottomColor)) score += 20;
      
      // اگه هر دو فصل یکسان داشته باشن
      if (top.season && bottom.season && top.season === bottom.season) score += 10;
      
      // اگه style یکسان
      if (top.style && bottom.style && top.style === bottom.style) score += 10;
      
      return Math.min(100, score);
    },

    // ساخت نام ست
    generateOutfitName(top, bottom) {
      const topColor = (top.colors || [top.color])[0] || '';
      const topCat = top.category || '';
      const bottomCat = bottom.category || '';
      
      const nameMap = {
        'پیراهن+شلوار': `استایل ${topColor} شیک`,
        'پیراهن+دامن': `ست ${topColor} مجلسی`,
        'تیشرت+شلوار': `تیپ ${topColor} روزمره`,
        'بلوز+شلوار': `ست ${topColor} اداری`,
        'کت+شلوار': `استایل ${topColor} رسمی`,
        'پالتو+شلوار': `ست ${topColor} زمستانی`
      };
      
      return nameMap[`${topCat}+${bottomCat}`] || `ست ${topColor} ${topCat}`;
    },

    // تولید دلیل
    generateReason(top, bottom, shoe, score) {
      const reasons = [];
      const topColor = (top.colors || [top.color])[0] || '';
      
      if (score >= 80) reasons.push(`هماهنگی عالی رنگ ${topColor} با ${(bottom.colors || [bottom.color])[0]}`);
      else if (score >= 60) reasons.push(`ترکیب خوب رنگ‌ها`);
      
      if (top.style && bottom.style && top.style === bottom.style) {
        reasons.push(`هر دو در سبک ${top.style}`);
      }
      
      if (top.season && bottom.season && top.season === bottom.season) {
        reasons.push(`مناسب فصل ${top.season}`);
      }
      
      if (shoe) reasons.push(`کفش شما ست رو کامل می‌کنه`);
      
      return reasons.join(' • ') || 'ترکیب پیشنهادی AI بر اساس کمد شما';
    },

    // تشخیص موقعیت
    guessOccasion(top, bottom) {
      if (top.category === 'کت' || top.category === 'پالتو') return 'رسمی';
      if (top.category === 'پیراهن') return 'مجلسی';
      if (top.category === 'تیشرت') return 'روزمره';
      return 'همه‌منظوره';
    },

    // پیشنهاد محصول واقعی برای تکمیم ست
    suggestProductsForOutfit(outfit, allProducts, limit = 4) {
      const suggestions = [];
      
      // ۱) محصولات با رنگ مکمل (اولویت اول)
      outfit.complementaries.forEach(color => {
        const matches = allProducts.filter(p => 
          (p.colors || []).some(c => c.includes(color) || color.includes(c)) ||
          (p.color && (p.color.includes(color) || color.includes(p.color)))
        );
        suggestions.push(...matches.map(p => ({ ...p, suggestReason: `رنگ مکمل: ${color}`, priority: 1 })));
      });
      
      // ۲) محصولات در دسته‌های گمشده
      const haveItems = new Set(outfit.items.map(i => i.category));
      const neededCategories = ['کفش', 'اکسسوری'].filter(c => !haveItems.has(c));
      neededCategories.forEach(cat => {
        const matches = allProducts.filter(p => p.category === cat);
        suggestions.push(...matches.map(p => ({ ...p, suggestReason: `تکمیل ست با ${cat}`, priority: 2 })));
      });
      
      // ۳) محصولات بر اساس موقعیت
      const occasionProducts = allProducts.filter(p => 
        p.tags && p.tags.some(t => t.includes(outfit.occasion) || outfit.occasion.includes(t))
      );
      suggestions.push(...occasionProducts.map(p => ({ ...p, suggestReason: `مناسب ${outfit.occasion}`, priority: 3 })));
      
      // حذف تکراری + مرتب‌سازی بر اساس اولویت
      const seen = new Set();
      const unique = suggestions.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      
      return unique
        .sort((a, b) => a.priority - b.priority)
        .slice(0, limit);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 📡 API عمومی
  // ═══════════════════════════════════════════════════════════════
  window.DPWardrobeAI = {
    ColorAnalyzer,
    OutfitEngine,
    
    async analyzeImage(url) {
      return await ColorAnalyzer.analyze(url);
    },
    
    buildOutfits(wardrobe, options) {
      return OutfitEngine.buildOutfits(wardrobe, options);
    },
    
    suggestProducts(outfit, products, limit) {
      return OutfitEngine.suggestProductsForOutfit(outfit, products, limit);
    }
  };

  console.log('🤖 DP Wardrobe AI v18.2 loaded (Smart Outfit + Image Analysis)');
})();
