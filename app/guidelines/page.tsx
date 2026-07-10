import { DocShell, DocSection, Bullets } from "@/components/doc";
import { FAN_INSPIRED_DISCLAIMER } from "@/lib/taxonomy";

export const metadata = { title: "Community Guidelines", description: "How buyers and creators are expected to treat each other on Realm." };

export default function GuidelinesPage() {
  return (
    <DocShell title="Community Guidelines" intro="These guidelines describe how everyone on Realm — buyers and creators alike — is expected to treat each other. They apply to every message, listing, comment, and profile.">
      <DocSection heading="Our community">
        Realm exists for painters, sculptors, printing studios, tabletop gamers, and collectors who care about the craft of miniatures. Keep interactions focused on that craft.
      </DocSection>

      <DocSection heading="Respectful communication">
        <Bullets items={[
          "No harassment, threats, or hateful language directed at someone's identity, background, or beliefs.",
          "No sexual harassment or unwanted advances in messages, comments, or profiles.",
          "Disagreements about pricing, revisions, or quality should stay factual and professional. Frustration happens; personal attacks aren't acceptable.",
        ]} />
      </DocSection>

      <DocSection heading="Fair dealing between buyers and creators">
        Since Realm doesn't currently process payments or shipping itself, honest and clear communication before any money changes hands is essential for everyone's protection.
        <Bullets items={[
          "Creators are expected to clearly state their price, shipping terms, and refund or cancellation policy before starting work or accepting payment. See Trust & Safety for a ready-to-use order terms template.",
          "Buyers are expected to pay as agreed and to communicate promptly about delays, changes, or cancellations.",
          "Neither party should ask the other to misrepresent an order's price, contents, or condition — for example, to get around customs charges.",
        ]} />
      </DocSection>

      <DocSection heading="Content & listing standards">
        <Bullets items={[
          "Portfolio and product photos must be your own work, or work you have explicit permission to display.",
          "Listings should accurately describe materials, scale, condition, and whether an item is a physical piece, a digital file, or a commission slot.",
        ]} />
      </DocSection>

      <DocSection heading="Every listing belongs to one of three categories">
        <Bullets items={[
          <><strong>Original Design:</strong> your own character, creature, or concept. No special restrictions beyond the standards above.</>,
          <><strong>Licensed Miniature Painting:</strong> a painting or finishing service applied to an officially published, purchasable miniature or kit. State the official product line in your listing.</>,
          <><strong>Fan-Inspired Design:</strong> a sculpt or piece based on a copyrighted character from a film, show, game, comic, or anime that doesn't have an official painting-ready kit. This is allowed on Realm, but you are personally responsible for any rights issues. A standard unofficial, fan-made disclaimer is shown automatically on these listings, and they can be removed if the rights holder objects.</>,
        ]} />
        <p style={{ marginTop: 10 }}>
          Changing a character's art style, setting, or outfit does not remove it from this policy. A recognizable character stays a recognizable character regardless of visual reinterpretation, and is still treated as a Fan-Inspired Design.
        </p>
      </DocSection>

      <DocSection heading="How browsing is organized">
        Realm organizes browsing into five general sections: Tabletop Games, Movies, Games, Anime, and Original Designs. These describe the kind of work, not a specific brand. Within each section, you can find a specific franchise through tags and search. Realm doesn't build sections or menus around individual brands or franchises.
      </DocSection>

      <DocSection heading="The disclaimer shown on Fan-Inspired listings">
        <p style={{ padding: 14, borderRadius: 12, background: "rgba(224,138,122,.08)", border: "1px solid rgba(224,138,122,.25)", fontSize: 14, fontStyle: "italic" }}>
          {FAN_INSPIRED_DISCLAIMER}
        </p>
      </DocSection>
    </DocShell>
  );
}
