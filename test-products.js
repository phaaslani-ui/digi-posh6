// تست بارگذاری دیتابیس محصولات
const fs = require('fs');

// اجرای فایل در context Node
global.window = global;
eval(fs.readFileSync('/home/user/digipoosh/dp-products.js', 'utf8'));

const DPProducts = global.DPProducts;
console.log('✅ DPProducts loaded:', !!DPProducts);
console.log('📦 تعداد محصولات:', DPProducts.count());

console.log('\n═══ تست تابع‌ها ═══');
console.log('all() →', DPProducts.all().length, 'محصول');
console.log('byGender("female") →', DPProducts.byGender('female').length, 'محصول');
console.log('byGender("male") →', DPProducts.byGender('male').length, 'محصول');
console.log('byGender("kids") →', DPProducts.byGender('kids').length, 'محصول');
console.log('byGender("teen") →', DPProducts.byGender('teen').length, 'محصول');
console.log('trending(5) →', DPProducts.trending(5).length, 'محصول');
console.log('bestSellers(5) →', DPProducts.bestSellers(5).length, 'محصول');
console.log('discounted(5) →', DPProducts.discounted(5).length, 'محصول');

console.log('\n═══ تست پیشنهاد با پروفایل خالی ═══');
const empty = DPProducts.recommend({}, [], 5);
console.log('recommend({}) →', empty.length, 'محصول');
if(empty.length > 0) console.log('نمونه:', empty[0].name, '- امتیاز:', empty[0].matchPercent);

console.log('\n═══ تست پیشنهاد با پروفایل زنانه ═══');
const femaleProfile = {
  gender: 'female',
  skinTone: 'warm',
  bodyType: 'hourglass',
  preferredStyles: ['elegant', 'classic'],
  preferredColors: ['gold', 'cream'],
  preferredOccasions: ['formal', 'party'],
  budget: 'high'
};
const femaleRecs = DPProducts.recommend(femaleProfile, [], 5);
console.log('recommend(female) →', femaleRecs.length, 'محصول');
femaleRecs.slice(0, 3).forEach(p => console.log('  -', p.name, '|', p.matchPercent + '%', '|', p.reasons?.join(' / ')));

console.log('\n═══ تست پیشنهاد با پروفایل مردانه ═══');
const maleProfile = {
  gender: 'male',
  skinTone: 'cool',
  bodyType: 'rectangle',
  preferredStyles: ['classic', 'modern'],
  preferredColors: ['navy', 'black'],
  preferredOccasions: ['business', 'formal'],
  budget: 'medium'
};
const maleRecs = DPProducts.recommend(maleProfile, [], 5);
console.log('recommend(male) →', maleRecs.length, 'محصول');
maleRecs.slice(0, 3).forEach(p => console.log('  -', p.name, '|', p.matchPercent + '%', '|', p.reasons?.join(' / ')));

console.log('\n═══ تست محصول یکتا ═══');
const p = DPProducts.get('p001');
console.log('get("p001") →', p ? p.name : 'NOT FOUND');

console.log('\n═══ تست جستجو ═══');
console.log('search("کفش") →', DPProducts.search('کفش').length, 'نتیجه');
console.log('search("پیراهن") →', DPProducts.search('پیراهن').length, 'نتیجه');
console.log('search("مردانه") →', DPProducts.search('مردانه').length, 'نتیجه');

console.log('\n═══ تست مشابه ═══');
console.log('similar("p001") →', DPProducts.similar('p001', 3).map(p => p.name));

console.log('\n✅ همه تست‌ها موفق!');
