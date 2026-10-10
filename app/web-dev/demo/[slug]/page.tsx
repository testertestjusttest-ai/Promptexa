import { redirect } from "next/navigation";

/** Legacy route — clean URLs are now /demofashion, /demorestaurant, etc. */
export default async function LegacyDemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/demo${slug}`);
}
