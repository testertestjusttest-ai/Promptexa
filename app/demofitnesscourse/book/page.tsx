import type { Metadata } from "next";
import { BookView } from "../_views";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Coaching Call — FitForm | Demo Website by DigiPlyra",
  description: "FitForm demo coaching-call booking — stored in your browser only.",
};

export default function Page() {
  return <BookView />;
}
