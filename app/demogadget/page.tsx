import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("gadget");

export default function Page() {
  return <DemoPageView slug="gadget" />;
}
