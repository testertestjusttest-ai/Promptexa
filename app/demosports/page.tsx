import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("sports");

export default function Page() {
  return <DemoPageView slug="sports" />;
}
