import { DocShell, DocSection, QA } from "@/components/doc";

export const metadata = { title: "FAQ", description: "Common questions about buying, selling, payment and shipping on Realm." };

export default function FAQPage() {
  return (
    <DocShell title="FAQ" intro="Common questions about how Realm works for buyers and creators.">
      <DocSection heading="General">
        <QA q="What is Realm?">
          Realm is a marketplace built for painted 3D-printed miniatures and collectible figures. It connects artists and painters, 3D sculptors, tabletop gamers, and collectors in one place, so you can commission, buy, sell, and showcase miniature art without juggling five different platforms.
        </QA>
        <QA q="Who is Realm for?">
          Collectors and buyers looking for painted miniatures, custom commissions, or unique collectible figures; creators (painters, sculptors, and printing studios) who want to sell finished pieces, digital 3D files, or painting services; and tabletop gamers who want army-ready, professionally painted units without doing the painting themselves.
        </QA>
        <QA q="Is Realm free to use?">
          Yes. Realm is currently free for everyone. As an early-stage platform, we don't take any commission on sales yet. Payment and shipping are arranged directly between you and the creator. Realm may introduce a small commission on completed sales in the future as the platform grows, but that's not the case today.
        </QA>
        <QA q="What makes Realm different from a generic marketplace?">
          Realm is built specifically around the miniatures and collectibles hobby: creator portfolio pages, commission workflows, and (soon) royalty tools for 3D designers are native to the platform, not bolted on.
        </QA>
      </DocSection>

      <DocSection heading="For buyers">
        <QA q="How do I find something I like?">
          Browse the catalog by category, style, or game system, or go straight to a creator's profile page to see their full portfolio.
        </QA>
        <QA q="Can I commission a custom piece?">
          Yes. Most creators accept custom commissions. Message them directly through the platform to discuss the concept, scope, and price before placing an order.
        </QA>
        <QA q="How do I message a creator?">
          Every creator profile has a "Message" option. Conversations happen inside Realm, so your order details and communication history stay in one place.
        </QA>
        <QA q="How does payment work?">
          Realm is a young platform, so payments currently happen directly between you and the creator, outside of Realm's checkout. You'll agree on price, payment method, and terms directly with the creator through your conversation thread.
        </QA>
        <QA q="What if I'm not happy with my order?">
          Start by discussing it with the creator through your conversation thread. Since payment is arranged directly with the creator, most issues (revisions, refunds, adjustments) need to be resolved between the two of you. Realm's support team can offer general guidance, but can't process refunds or hold funds, as payment doesn't go through the platform.
        </QA>
        <QA q="How does shipping work?">
          As a young, early-stage platform, Realm doesn't manage shipping directly yet. Shipping cost, timeline, and method are arranged directly with the creator you're ordering from.
        </QA>
      </DocSection>
    </DocShell>
  );
}
