import type { Metadata } from "next";
import { CourseView } from "../_views";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Course — FitForm | Demo Website by DigiPlyra",
  description: "FitForm demo course area — lessons unlock after the demo checkout.",
};

export default function Page() {
  return <CourseView />;
}
