# RZRX Unified Pro (Front + API + Supabase)
**حزمة متكاملة جاهزة للإطلاق** — واجهة ستاتيك + دوال Vercel + سكربتات Supabase.

## تشغيل سريع
1) Supabase → SQL Editor → شغّل `supabase/schema.sql` (+ اختياري `supabase/seed.sql`).
2) Vercel → Import المشروع → أضف متغيرات البيئة (Env) → Deploy.
3) عدّل `js/config.example.js` إلى `js/config.js` وحدّد `API_BASE` = دومين Vercel.
4) جرّب الدخول من `dashboard.html`، والشراء من `products.html`، وشحن رصيد من `admin.html`.

## المتغيرات (Env)
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_REDIRECT_URI=https://YOUR_APP.vercel.app/api/auth/discord/callback
FRONTEND_URL=https://rzrx.site
JWT_SECRET=change_me_to_a_strong_random_string
ADMIN_TOKEN=choose_a_strong_admin_token
```

## مسارات الـ API
- `GET /api` — Health check
- `GET /api/products` — المنتجات (public read)
- `GET /api/auth/discord/login` — تحويل لـ Discord OAuth
- `GET /api/auth/discord/callback` — إتمام OAuth + JWT + upsert user
- `GET /api/auth/me` — فحص الجلسة
- `POST /api/secure/buy` — شراء مؤمّن بالـ JWT
- `POST /api/admin/credit` — شحن/خصم بالتوكن

— Generated: 2025-08-18
