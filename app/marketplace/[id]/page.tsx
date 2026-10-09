import type { Metadata } from "next";
import DetailClient from "./DetailClient";

export const metadata: Metadata = { title: "ID বিস্তারিত — DigiPlyra" };

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailClient id={id} />;
}
