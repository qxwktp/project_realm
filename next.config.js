/** @type {import('next').NextConfig} */
const supaHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { return ""; }
})();
module.exports = {
  images: {
    remotePatterns: supaHost ? [{ protocol: "https", hostname: supaHost }] : [],
  },
};
