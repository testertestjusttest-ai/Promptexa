import type { Metadata } from "next";
import DetailClient from "./DetailClient";

export const metadata: Metadata = { title: "ID Details — DigiPlyra", description: "View a Free Fire ID listing, buy safely through escrow, and chat with the seller." };

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailClient id={id} />;
}
