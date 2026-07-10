import { DocShell, DocSection, QA, Placeholder } from "@/components/doc";
import { LINE, MUTE, TEXT, PANEL2 } from "@/components/ui";
import { IP_CONTACT_EMAIL } from "@/lib/taxonomy";

export const metadata = { title: "Trust & Safety", description: "Staying safe on Realm while payments happen directly between buyers and creators." };

const TEMPLATE_LINES: [string, string][] = [
  ["Item or commission", "describe what you're making"],
  ["Price", "amount and currency"],
  ["What's included", "for example, number of revisions, base included, size"],
  ["Turnaround time", "estimate, for example 2 to 3 weeks"],
  ["Payment method", "for example PayPal, bank transfer"],
  ["Payment timing", "for example 50% deposit upfront, remainder on completion"],
  ["Shipping", "cost, carrier, estimated delivery time, whether you ship internationally"],
  ["Refund and cancellation policy", "your policy, for example no refunds once work has started"],
];

export default function TrustPage() {
  return (
    <DocShell title="Trust & Safety" intro="Realm is an early-stage platform. Payments and shipping currently happen directly between buyers and creators, not through Realm's checkout. Here's what that means for your safety.">
      <DocSection heading="Payment safety">
        <QA q="Is my payment information safe?">
          Since payments are arranged directly between buyers and creators, Realm doesn't collect or store any payment details itself. Always agree on a secure, trusted payment method with the creator directly, and be cautious of any request that feels unusual for a normal purchase.
        </QA>
        <QA q="What payment methods are safer to use?">
          <Placeholder>Confirm recommended methods before publishing. For example, some payment services offer buyer protection on goods-and-services payments, while direct bank transfers or crypto typically don't.</Placeholder>
        </QA>
      </DocSection>

      <DocSection heading="Creator verification">
        <QA q="How are creators verified on Realm?">
          <Placeholder>Describe verification process once defined — for example portfolio review, ID check for payouts, etc.</Placeholder>
        </QA>
      </DocSection>

      <DocSection heading="Before you pay: order terms template">
        <p style={{ color: TEXT, marginBottom: 14 }}>
          Because Realm doesn't process payments, the clearest way to protect both sides of an order is to agree on terms in writing before any money changes hands. Creators are expected to fill in and send a version of this template to each buyer before starting an order.
        </p>
        <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, background: PANEL2 }}>
          <div style={{ fontSize: 13, color: MUTE, marginBottom: 12 }}>Copy this, fill it in, and send it to your buyer before they pay:</div>
          {TEMPLATE_LINES.map(([label, hint]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 14.5 }}>{label}:</strong>{" "}
              <span style={{ color: MUTE, fontStyle: "italic", fontSize: 14 }}>[{hint}]</span>
            </div>
          ))}
          <p style={{ marginTop: 12, fontSize: 14.5 }}>Let me know if this works for you. I'll get started once we confirm these terms together.</p>
        </div>
        <p style={{ color: MUTE, fontSize: 14, marginTop: 12 }}>
          Buyers: if a creator hasn't sent you something like this before asking for payment, feel free to ask for it.
        </p>
      </DocSection>

      <DocSection heading="Disputes & reporting">
        <QA q="What happens if there's a dispute?">
          Realm's support team can review your conversation with the creator and offer guidance, but since payment and shipping happen directly between the two of you, Realm can't issue refunds or hold funds. Keep your communication and agreed terms inside your conversation thread so they're easy to review.
        </QA>
        <QA q="How do I report a listing or an intellectual-property concern?">
          Every listing has a Report action that routes to our content and IP review queue. For formal intellectual-property complaints, our designated contact is{" "}
          <span style={{ color: "#e0b57a", fontStyle: "italic" }}>{IP_CONTACT_EMAIL}</span>.{" "}
          <Placeholder>A formal Designated Agent registration with the US Copyright Office is handled separately by legal.</Placeholder>
        </QA>
      </DocSection>
    </DocShell>
  );
}
