import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("sweets");

export default function Page() {
  return <DemoPageView slug="sweets" />;
}
