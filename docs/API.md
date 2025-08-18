# API Docs (مختصر)
## GET /api/products
يرجع قائمة المنتجات الفعّالة.

## GET /api/auth/discord/login
تحويل للموافقة على دخول Discord.

## GET /api/auth/discord/callback
يتسلم code → يجيب access_token → يجيب /users/@me → يعمل upsert → يولّد JWT ويعيد توجيهك للواجهة مع `#token=...`

## GET /api/auth/me
يتحقق من الـ JWT ويرجع بيانات المستخدم.

## POST /api/secure/buy
Body: `{ "product_id": "uuid" }`
Header: `Authorization: Bearer <JWT>`

## POST /api/admin/credit
Body: `{ "user_id":"...", "delta": 100 }`
Header: `Authorization: Bearer <ADMIN_TOKEN>`
