/** @type {import('next').NextConfig} */

/*
 * ============================================================
 * سربرگ‌های امنیتی
 * ------------------------------------------------------------
 * پیش از این فقط سربرگ‌های CORS بود. سربرگ‌های محافظ نبودند،
 * یعنی سایت در برابر چند حمله‌ی رایج باز بود:
 *
 *   • clickjacking — کسی سایت را داخل iframe نامرئی می‌گذارد
 *     و کاربر ناخواسته روی دکمه‌ها کلیک می‌کند
 *   • MIME sniffing — مرورگر فایل را با نوع اشتباه اجرا می‌کند
 *   • نشت Referrer — نشانی کامل صفحه به سایت‌های دیگر می‌رود
 * ============================================================
 */
const SECURITY_HEADERS = [
  /* جلوگیری از قرار گرفتن سایت در iframe دیگران */
  { key: 'X-Frame-Options', value: 'DENY' },

  /* مرورگر نوع فایل را حدس نزند */
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  /* نشانی کامل صفحه به سایت دیگر نرود */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  /* دسترسی‌هایی که سایت اصلاً لازم ندارد، بسته بماند */
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },

  /*
   * HSTS — مرورگر برای یک سال فقط با HTTPS وصل شود.
   * فقط در تولید، چون در توسعه‌ی محلی HTTPS نداریم.
   */
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
];

const nextConfig = {
  reactStrictMode: true,

  /* نسخه‌ی Next در سربرگ پاسخ نیاید — اطلاعات اضافه به مهاجم می‌دهد */
  poweredByHeader: false,

  async headers() {
    return [
      {
        /* سربرگ‌های امنیتی روی همه‌ی مسیرها */
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },

          /*
           * پاسخ API هرگز نباید کش شود.
           * بدون این، پراکسی میانی می‌تواند پاسخ کاربر «الف» را
           * به کاربر «ب» بدهد — نشت اطلاعات شخصی.
           */
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
