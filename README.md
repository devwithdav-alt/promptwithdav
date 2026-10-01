# PromptWithDav (Next.js + Supabase)

Pages: `/` `/shop` `/product/<slug>` `/about` `/contact` `/checkout` `/order?ref=...` and the hidden `/admin`.
Paystack is intentionally switched off for now; payment is manual bank/MoMo transfer until we wire Paystack in.

## 1. Supabase (once)
1. Create a project at supabase.com. Project Settings > API: note the **Project URL** and **anon key**.
2. SQL Editor: paste all of `supabase/schema.sql` and Run.
3. Authentication > Users > Add user: your admin email + strong password (auto-confirm).
4. Authentication > Sign In / Providers: turn OFF "Allow new users to sign up". Turn on CAPTCHA protection if offered.
5. SQL Editor: `insert into admins(email) values ('your-admin-email');`

## 2. Resend (email delivery)
Create an account at resend.com, verify your domain, create an API key. Sender example: `PromptWithDav <orders@yourdomain.com>`.

## 3. Edge Functions (order + delivery)
Install the Supabase CLI, then in this folder:
```
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="PromptWithDav <orders@yourdomain.com>" SITE_URL=https://yourdomain.com
supabase functions deploy create-order
supabase functions deploy get-order
supabase functions deploy deliver-order
```
(`paystack-webhook` is included for later. Don't deploy it until we add Paystack.)

## 4. GitHub
Create a repository and push this folder (`git init`, `git add .`, `git commit -m "first"`, `git remote add origin ...`, `git push -u origin main`). `.env` and `node_modules` are git-ignored.

## 5. Netlify
1. netlify.com > Add new site > Import an existing project > GitHub > choose the repo. Netlify detects Next.js by itself.
2. Site configuration > Environment variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `NEXT_PUBLIC_SITE_URL` = `https://yourdomain.com` (or your netlify.app address for now)
3. Deploy. Then Domain management > add your domain and follow the DNS steps (HTTPS is automatic).
4. Set the same address as `SITE_URL` in step 3 and redeploy the functions if it changed.

## 6. Using it
- Open `/admin`, sign in. Add products (price, images, the **private prompt text** delivered after payment), edit all text/links/background/banners, manage payment methods, view **Orders**.
- Manual-transfer orders show as `pending`. When the money arrives, open Orders and click **Mark paid & deliver**; the customer gets an email and the prompts appear on their `/order` page.
- Changes you save appear on the public site within about a minute (pages refresh every 60 seconds).
- Without Supabase keys the site shows demo products so you can preview the design locally.

## Run locally
```
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

## Later: Paystack
Create `paystack-webhook` and a checkout popup using `pk_` key in Admin > Payments. Everything else (orders table, delivery, order page) is already in place.

## Security notes
- Prices are read from the database by the server when an order is created; the browser can't change them.
- Prompt text lives in a private table, readable only by the server functions and the admin.
- Admin edits require a Supabase login whose email is in `admins`; database rules enforce this, not just the screen.
- Orders are rate limited per IP; honeypot fields catch simple bots; admin has a 3-strike lockout and 15-minute idle logout.
- Security headers and a content security policy are set in `next.config.js`.
