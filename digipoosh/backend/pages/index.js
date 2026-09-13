export default function Home() {
  return (
    <div style={{
      fontFamily: 'Vazirmatn, system-ui, sans-serif',
      direction: 'rtl', padding: 40, background: '#f5f0e8',
      minHeight: '100vh', color: '#1a1a1a',
    }}>
      <h1 style={{ color: '#c9a84c' }}>بک‌اند دیجی‌پوش فعال است</h1>
      <p>این سرویس فقط API ارائه می‌دهد. فرانت‌اند به‌صورت جداگانه اجرا می‌شود.</p>
      <p style={{ color: '#8a7e72' }}>
        برای بررسی سلامت سرویس: <code>/api/health</code>
      </p>
    </div>
  );
}
