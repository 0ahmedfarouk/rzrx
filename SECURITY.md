# Security Notes
- استخدم `SUPABASE_SERVICE_ROLE` فقط على السيرفر (دوال Vercel) ولا تضعه في الواجهة.
- فعّل RLS لاحقًا وسياسات دقيقة للإنتاج.
- اختر `JWT_SECRET` قوي، وغيّر `ADMIN_TOKEN` دوريًا.
- أضف Rate-Limiting على مستوى Vercel/Edge إذا رغبت.
