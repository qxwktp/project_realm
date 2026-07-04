/**
 * Realm — demo seed script (standalone).
 *
 * Fills your LIVE Supabase project with a few creators, buyers, products,
 * portfolio pieces, a couple of orders and reviews, so the site looks alive
 * when you or your boss first open it.
 *
 * HOW TO RUN — see the big comment block at the bottom, or the README section
 * "Optional: add demo data". In short:
 *   1) put your Supabase URL + service_role key in .env  (NOT the anon key)
 *   2) run:  node supabase/seed.mjs
 *
 * Safe to run more than once: it clears the demo rows it created before re-adding.
 * It does NOT touch real accounts you create through the website.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// --- load .env (simple parser, no dependency) -------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, "..", ".env"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* .env optional if vars already exported */ }

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE) {
  console.error("\n❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("   Add them to a .env file in the project root, then run again.\n");
  process.exit(1);
}

const db = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

const DEMO_TAG = "demo.realm"; // demo emails end with @demo.realm so we can find/clean them

// --- demo content -----------------------------------------------------------
const creators = [
  { email: `mara@${DEMO_TAG}`, display_name: "Mara Voss", username: "maravoss",
    bio: "Grimdark specialist. NMM metals, weathered armour, story on every base.",
    socials: { instagram: "maravoss.minis" } },
  { email: `dain@${DEMO_TAG}`, display_name: "Dain Holt", username: "dainholt",
    bio: "Bright fantasy heroes and characterful NPCs for your campaign.",
    socials: { instagram: "dain.paints" } },
  { email: `sable@${DEMO_TAG}`, display_name: "Sable Renn", username: "sablerenn",
    bio: "Monsters, beasts and terrain with a painterly touch.",
    socials: {} },
];
const buyers = [
  { email: `alex@${DEMO_TAG}`, display_name: "Alex Kerr", username: "alexkerr" },
  { email: `noor@${DEMO_TAG}`, display_name: "Noor Haddad", username: "noorh" },
];

const PRODUCTS = [
  // The 6th element (when present) is a local photo file in ./seed-media that the
  // script uploads to the 'products' storage bucket and links via product_images.
  ["Batman vs Joker Diorama", "Collectibles", 120, "Hand-painted diorama, 1/10 scale. Batman and Joker mid-clash on a cobbled alley base with sculpted rubble and a working lamppost. A statement centrepiece.", "published", "batman-joker.jpg"],
  ["Zeus, King of Olympus", "Heroes", 95, "Resin display figure, ~30cm. Greek god of thunder with freehand gold armour, marble-effect drapery and a hand-cut lightning bolt.", "published", "zeus.jpg"],
  ["Ashen Paladin", "Heroes", 42, "Resin, 32mm. Hand-painted NMM gold, freehand heraldry, cracked-earth base.", "published"],
  ["Bog Wraith", "Monsters", 38, "A drifting horror in muted greens with OSL from a spectral lantern.", "published"],
  ["Tavern Keeper", "NPCs", 24, "Friendly quest-giver, warm tones, apron and ale included.", "published"],
  ["Ruined Watchtower", "Terrain", 55, "Modular terrain piece, weathered stone and creeping ivy.", "published"],
  ["Frost Drake Bust", "Busts", 60, "Display bust, 1/10 scale, icy blues and pearlescent scales.", "published"],
  ["Shadow Assassin", "Heroes", 40, "Dark cloak with subtle purple glaze, blade with cold OSL.", "published"],
  ["Ember Elemental", "Monsters", 45, "Glowing core, object-source lighting through cracked rock.", "published"],
  ["Market Herbalist", "NPCs", 22, "Charming stall-keeper with tiny painted vials.", "draft"],
];

async function findUserByEmail(email) {
  // paginate through users to find by email (admin API has no direct getByEmail)
  let page = 1;
  while (page < 20) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page++;
  }
  return null;
}

async function ensureUser(spec, role) {
  const existing = await findUserByEmail(spec.email);
  let userId;
  if (existing) {
    userId = existing.id;
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email: spec.email,
      password: "realmdemo123",
      email_confirm: true,
      user_metadata: { display_name: spec.display_name, username: spec.username, role },
    });
    if (error) throw error;
    userId = data.user.id;
  }
  // the handle_new_user trigger creates the profile row; update it with rich fields
  const { error: upErr } = await db.from("profiles").update({
    display_name: spec.display_name, username: spec.username, role,
    bio: spec.bio || "", socials: spec.socials || {},
  }).eq("id", userId);
  if (upErr) throw upErr;
  return userId;
}

async function cleanup() {
  // delete demo auth users (cascades to their rows via FK on delete cascade)
  let page = 1;
  const toDelete = [];
  while (page < 20) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) if (u.email?.endsWith(`@${DEMO_TAG}`)) toDelete.push(u.id);
    if (data.users.length < 200) break;
    page++;
  }
  for (const id of toDelete) await db.auth.admin.deleteUser(id);
  if (toDelete.length) console.log(`   cleared ${toDelete.length} previous demo users`);
}

async function main() {
  console.log("→ Seeding Realm demo data…");
  console.log("   cleaning up any previous demo rows first…");
  await cleanup();

  // categories are created by the migration; fetch their ids
  const { data: cats, error: catErr } = await db.from("categories").select("*");
  if (catErr) throw catErr;
  const catId = (name) => cats.find((c) => c.name === name)?.id ?? null;

  console.log("   creating creators…");
  const creatorIds = [];
  for (const c of creators) creatorIds.push(await ensureUser(c, "creator"));

  console.log("   creating buyers…");
  const buyerIds = [];
  for (const b of buyers) buyerIds.push(await ensureUser(b, "buyer"));

  console.log("   adding products…");
  const productIds = [];
  PRODUCTS.forEach((p, i) => productIds.push({ spec: p, creator: creatorIds[i % creatorIds.length] }));
  const insertedProducts = [];
  for (const { spec, creator } of productIds) {
    const [title, cat, price, description, status, photo] = spec;
    const { data, error } = await db.from("products").insert({
      creator_id: creator, category_id: catId(cat), title, description, price, status,
    }).select("id").single();
    if (error) throw error;
    insertedProducts.push({ id: data.id, creator });

    // If this product has a real photo, upload it to Storage and link it.
    if (photo) {
      try {
        const bytes = readFileSync(join(__dirname, "seed-media", photo));
        // path is prefixed with the creator's id so it matches the storage RLS policy
        const path = `${creator}/${data.id}/${photo}`;
        const up = await db.storage.from("products").upload(path, bytes, {
          contentType: "image/jpeg", upsert: true,
        });
        if (up.error) {
          console.log(`   ⚠ could not upload ${photo}: ${up.error.message}`);
        } else {
          await db.from("product_images").insert({ product_id: data.id, path, sort: 0 });
          console.log(`   ✓ uploaded ${photo}`);
        }
      } catch (e) {
        console.log(`   ⚠ photo ${photo} not found or failed: ${e.message}`);
      }
    }
  }

  console.log("   adding portfolio pieces…");
  // Upload the two real photos to the portfolio bucket and give each creator a
  // couple of portfolio entries that point at real, viewable images.
  const portfolioPhotos = ["batman-joker.jpg", "zeus.jpg"];
  const uploadedPortfolio = [];
  for (const cid of creatorIds) {
    for (let i = 0; i < portfolioPhotos.length; i++) {
      try {
        const file = portfolioPhotos[i];
        const bytes = readFileSync(join(__dirname, "seed-media", file));
        const path = `${cid}/portfolio-${i}-${file}`;
        const up = await db.storage.from("portfolio").upload(path, bytes, { contentType: "image/jpeg", upsert: true });
        if (!up.error) {
          await db.from("portfolio_items").insert({ creator_id: cid, title: `Commission ${i + 1}`, path, sort: i });
          uploadedPortfolio.push(path);
        }
      } catch { /* skip if media missing */ }
    }
  }

  console.log("   adding orders + reviews…");
  // buyer[0] completed an order with creator[0] and left a review
  const p0 = insertedProducts[0];
  const { data: o1 } = await db.from("orders").insert({
    buyer_id: buyerIds[0], creator_id: creatorIds[0], product_id: p0.id, status: "closed",
    note: "Loved the base work — thank you!",
  }).select("id").single();
  await db.from("ratings").insert({
    order_id: o1.id, creator_id: creatorIds[0], buyer_id: buyerIds[0], score: 5,
    text: "Incredible detail and fast communication. Will commission again.",
  });
  // an open order for creator[1]
  await db.from("orders").insert({
    buyer_id: buyerIds[1], creator_id: creatorIds[1],
    product_id: insertedProducts.find((p) => p.creator === creatorIds[1])?.id ?? null,
    status: "requested", note: "Could you do a winter colour scheme?",
  });
  // a starter conversation
  const { data: conv } = await db.from("conversations").insert({
    buyer_id: buyerIds[0], creator_id: creatorIds[0], product_id: p0.id,
  }).select("id").single();
  if (conv) {
    await db.from("messages").insert([
      { conversation_id: conv.id, sender_id: buyerIds[0], content: "Hi Mara! Is the Ashen Paladin available as a commission?", is_read: true },
      { conversation_id: conv.id, sender_id: creatorIds[0], content: "Absolutely — I can start next week. Any colour preferences?", is_read: false },
    ]);
  }

  console.log("\n✅ Done! Demo data added.\n");
  console.log("   Demo logins (password for all:  realmdemo123):");
  console.log(`     Creator:  mara@${DEMO_TAG}`);
  console.log(`     Buyer:    alex@${DEMO_TAG}`);
  console.log("   (You can delete all demo data later by running this script again,");
  console.log("    or by deleting the @" + DEMO_TAG + " users in Supabase → Authentication.)\n");
}

main().catch((e) => { console.error("\n❌ Seed failed:", e.message, "\n"); process.exit(1); });

/* ---------------------------------------------------------------------------
RUN INSTRUCTIONS

You need Node.js installed (nodejs.org, the "LTS" button). Then, in a terminal
opened inside the project folder:

  1. Make sure your .env file exists with these two lines filled in:
       NEXT_PUBLIC_SUPABASE_URL=...        (from Supabase → Settings → API)
       SUPABASE_SERVICE_ROLE_KEY=...       (the SECRET service_role key)

  2. Install the one library this script needs:
       npm install @supabase/supabase-js

  3. Run it:
       node supabase/seed.mjs

That's it. Refresh your site and you'll see creators, products and reviews.
--------------------------------------------------------------------------- */
