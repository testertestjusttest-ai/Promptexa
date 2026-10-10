import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("hotel");

export default function Page() {
  return <DemoPageView slug="hotel" />;
}
