import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("bakery");

export default function Page() {
  return <DemoPageView slug="bakery" />;
}
