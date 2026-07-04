# Realm — How to put it online and get a shareable link

This guide gets your Realm site onto the internet so you can send your boss a link.
No coding required — just follow each step in order. Take your time.

You'll use three free services:
- **GitHub** — stores your code
- **Supabase** — the database and login system
- **Vercel** — puts the site online and gives you the link

Total time: about 30–45 minutes the first time.

---

## Step 1 — Make free accounts (5 min)

Go to each site and sign up (you can click "Sign in with Google" on all three):
1. https://github.com
2. https://supabase.com
3. https://vercel.com

Keep all three browser tabs open.

---

## Step 2 — Put the code on GitHub (10 min)

1. On GitHub, click the **+** icon (top right) → **New repository**.
2. Name it `realm`. Leave everything else default. Click **Create repository**.
3. On the next page, click **uploading an existing file** (it's a small link in the text).
4. Drag the entire contents of the `realm/prod` folder (all the files from the zip) into the upload box.
5. Click **Commit changes**.

Your code now lives on GitHub. ✅

---

## Step 3 — Set up the database on Supabase (10 min)

1. On Supabase, click **New project**. Give it a name (`realm`), set a database
   password (write it down somewhere), pick the closest region, click **Create**.
2. Wait ~2 minutes for it to finish setting up.
3. In the left menu, click **SQL Editor** → **New query**.
4. Open the file `supabase/migrations/0001_init.sql` from your code, copy ALL of it,
   paste into the box, click **Run**. You should see "Success."
5. Repeat step 4 for `0002_rls.sql`, then again for `0003_storage.sql`
   (run them in that order).

Now get your keys:
6. In the left menu click **Project Settings** (gear icon) → **API**.
7. Keep this tab open — you'll copy three values in the next step:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "reveal" to see it)

Database ready. ✅

---

## Step 4 — Put the site online with Vercel (10 min)

1. On Vercel, click **Add New…** → **Project**.
2. Find your `realm` GitHub repo in the list, click **Import**.
3. Before clicking Deploy, open the **Environment Variables** section and add these
   (copy the values from the Supabase API tab in Step 3):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now, fix in Step 5 |

4. Click **Deploy**. Wait 1–2 minutes.
5. You'll see "Congratulations" and a link like `https://realm-xxxx.vercel.app`.

**That link is what you send your boss.** ✅

---

## Step 5 — One small fix so login works (3 min)

1. Copy your new Vercel link (e.g. `https://realm-xxxx.vercel.app`).
2. In Vercel: **Settings** → **Environment Variables** → edit `NEXT_PUBLIC_SITE_URL`,
   paste the link, save.
3. In Supabase: **Authentication** → **URL Configuration** → set **Site URL** to the
   same link. Save.
4. Back in Vercel: **Deployments** → click the **⋯** on the latest one → **Redeploy**.

Done. Your site is live and login/signup will work.

---

## What your boss will see

- The Realm homepage, catalog, and creator pages load for anyone with the link.
- To click around as a creator or buyer, he can sign up with an email on the site.
- If you'd like ready-made demo accounts with sample products, ask and I'll add a
  seed script you can run.

---

## If something goes wrong

- **Vercel build failed?** Open the deployment, read the red error line, and send it
  to me — it's usually one missing environment variable.
- **Site loads but login/signup errors?** Re-check Step 5 (the two URLs must match
  your real Vercel link exactly).
- **SQL error in Supabase?** Make sure you ran the three files in order (0001, 0002,
  0003) and copied the whole file each time.

You can always come back here and paste the exact error — I'll tell you the fix.

---

## Step 6 — Connect your domain: myrealm.io (10–15 min + wait)

You already own **myrealm.io**. After Steps 1–5 are done and the site works on the
`realm-xxxx.vercel.app` link:

1. In Vercel: open your project → **Settings** → **Domains**.
2. Type `myrealm.io` and click **Add**. Accept the option that also adds
   `www.myrealm.io` with a redirect.
3. Vercel shows you DNS records to add. Usually:
   - **A** record for `myrealm.io` → `76.76.21.21`
   - **CNAME** for `www` → `cname.vercel-dns.com`
   (Use the exact values Vercel shows you.)
4. Log in to the registrar where you bought myrealm.io, open **DNS settings**, and
   add those records (A record host = `@`, CNAME host = `www`). Save.
5. Back in Vercel the domain flips from "Pending" to a green **Valid** — this can
   take anywhere from 10 minutes to a few hours. The `https://` certificate is
   issued automatically.

Then point the app at the real domain:
6. Vercel → **Settings → Environment Variables** → set `NEXT_PUBLIC_SITE_URL` to
   `https://myrealm.io`. Save.
7. Supabase → **Authentication → URL Configuration** → set **Site URL** to
   `https://myrealm.io` (add it to **Redirect URLs** too). Save.
8. Vercel → **Deployments** → **⋯** on the latest → **Redeploy**.

Your site is now live at **https://myrealm.io** with working sign-up and login. 🎉

---

## Note on the video background

The homepage hero now plays `public/background.mp4` behind the text (muted, looping).
A still frame `public/background-poster.jpg` shows first for a fast load. Both files
are already in the `public/` folder — nothing extra to configure.

---

## Optional: add demo data (so the site isn't empty)

This fills the site with sample creators, painted miniatures and a review, plus
ready-made demo logins. Do this AFTER Steps 1–5 work.

You need **Node.js** first: go to https://nodejs.org, click the green **LTS**
button, install it (just keep clicking Next).

Then:
1. Download your code folder to your computer (from GitHub: green **Code** button →
   **Download ZIP**, then unzip). Skip if you already have the folder.
2. Create a file named `.env` in the project folder (same place as package.json).
   Put two lines in it, using values from Supabase → **Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service_role-secret-key
   ```
   ⚠️ Use the **service_role** key (the secret one), not the anon key.
3. Open a terminal in that folder:
   - **Windows:** open the folder in File Explorer, click the address bar, type
     `cmd`, press Enter.
   - **Mac:** right-click the folder → "New Terminal at Folder".
4. Run these two commands, one at a time:
   ```
   npm install @supabase/supabase-js
   npm run seed
   ```
5. Refresh your site — it's now full of demo content.

The demo also uploads two real product photos (a Batman-vs-Joker diorama and a
Zeus figure) into your Storage and builds full product pages for them, so you can
see image display, catalog, and product pages working end to end.

**Demo logins** (password for all: `realmdemo123`):
- Creator: `mara@demo.realm`
- Buyer: `alex@demo.realm`

To remove the demo data later, run `npm run seed` again (it resets), or delete the
`@demo.realm` users in Supabase → **Authentication → Users**.
