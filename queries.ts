import "./globals.css";
import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentProfile } from "@/lib/supabase/queries";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500","600","700"], variable: "--font-cinzel" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Realm — Curated 3D-printed miniatures", template: "%s · Realm" },
  description: "Realm connects the painters behind hand-finished 3D-printed miniatures with the players who want them. A place to choose, not to search.",
  openGraph: { title: "Realm", description: "Curated, hand-finished 3D-printed miniatures.", type: "website", url: SITE },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        <SiteHeader profile={profile} />
        <main className="container" style={{ paddingBottom: 80, minHeight: "70vh" }}>{children}</main>
        <SiteFooter />
        {ga ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga}');
            `}</Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
