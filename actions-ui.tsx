"use client";
import { useState } from "react";
import Link from "next/link";
import { OrdersList } from "./orders-list";
import { Empty } from "@/components/controls";
import { LINE, MUTE, TEXT } from "@/components/ui";
import type { Order, Product, Profile, Rating } from "@/types/db";

export function OrdersTabs({ me, asBuyer, asCreator, products, profiles, myRatings }: {
  me: Profile; asBuyer: Order[]; asCreator: Order[]; products: Product[]; profiles: Profile[]; myRatings: Rating[];
}) {
  const [tab, setTab] = useState<"buying" | "selling">(me.role === "creator" && asCreator.length ? "selling" : "buying");
  const isCreator = me.role === "creator";

  return (
    <>
      {isCreator && (
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${LINE}`, marginBottom: 20 }}>
          {([["buying", `As buyer (${asBuyer.length})`], ["selling", `As creator (${asCreator.length})`]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === k ? "var(--accent)" : "transparent"}`, color: tab === k ? TEXT : MUTE, padding: "10px 14px", cursor: "pointer", fontWeight: 600, marginBottom: -1 }}>{l}</button>
          ))}
        </div>
      )}

      {(tab === "buying" ? asBuyer : asCreator).length === 0 ? (
        <Empty
          title="No orders yet"
          body={tab === "buying" ? "Request a piece from a creator and it'll appear here so you can track it." : "Order requests from buyers will show up here."}
          action={tab === "buying" ? <Link href="/catalog" className="link">Browse catalog →</Link> : undefined}
        />
      ) : (
        <OrdersList
          orders={tab === "buying" ? asBuyer : asCreator}
          as={tab === "buying" ? "buyer" : "creator"}
          products={products}
          counterparts={profiles}
          myRatings={myRatings}
        />
      )}
    </>
  );
}
