import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("laundry");

export default function Page() {
  return <DemoPageView slug="laundry" />;
}
