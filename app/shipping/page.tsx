import { DocShell, DocSection, QA } from "@/components/doc";

export const metadata = { title: "Shipping & Returns", description: "How shipping, returns and refunds work on Realm." };

export default function ShippingPage() {
  return (
    <DocShell title="Shipping & Returns" intro="On Realm, shipping and refunds are arranged directly between you and the creator. Here's what that means.">
      <DocSection heading="Shipping">
        <QA q="How does shipping work on Realm?">
          Since Realm is an early-stage platform, shipping is arranged directly between you and the creator. When you place an order, discuss shipping details (cost, packaging, carrier, and expected delivery time) directly with the creator through your conversation thread before you pay.
        </QA>
        <QA q="Who determines the shipping cost and timeline?">
          The creator does. Because creators are independent artists based in different countries, shipping cost and delivery time vary depending on where they are located and where you are located. Always confirm both before agreeing to an order.
        </QA>
        <QA q="Does Realm provide tracking?">
          Not yet. Tracking numbers, if the creator's shipping method includes one, are shared directly by the creator through your conversation thread. Realm doesn't generate or store tracking information itself at this stage.
        </QA>
        <QA q="Do creators ship internationally?">
          Some do, some don't. International shipping availability, cost, and customs responsibility depend on each individual creator. Confirm with the creator before ordering if you're outside their country.
        </QA>
        <QA q="What if my order doesn't arrive or arrives damaged?">
          Contact the creator directly through your conversation thread as soon as possible. Since shipping is arranged and paid for directly between you and the creator, resolving delivery issues (reshipping, refunding, filing a carrier claim) is between the two of you. Realm can offer guidance but can't file claims or issue refunds on a creator's behalf.
        </QA>
      </DocSection>

      <DocSection heading="Returns & refunds">
        <QA q="Can I return an item I bought on Realm?">
          Return policies are set by each individual creator, not by Realm. Ask the creator about their return policy before placing an order, especially for one-of-a-kind or hand-painted pieces.
        </QA>
        <QA q="Can I get a refund?">
          Refunds are handled directly between you and the creator, since payment happens outside of Realm's checkout. If a creator agrees to a refund, they'll process it themselves through whatever payment method you used.
        </QA>
        <QA q="What about custom commissions?">
          Custom and commissioned pieces are typically non-refundable once work has started, since they're made specifically for you. Always confirm the creator's commission policy (deposits, revisions, cancellations) before starting an order.
        </QA>
        <QA q="What is Realm's role if something goes wrong?">
          Realm's support team can review your conversation with the creator and offer guidance, but since payment and shipping happen directly between you and the creator, Realm can't issue refunds, cover shipping losses, or force a return. Stronger buyer protections are planned as the platform grows.
        </QA>
      </DocSection>
    </DocShell>
  );
}
