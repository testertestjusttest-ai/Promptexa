import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("grocery");

export default function Page() {
  return <DemoPageView slug="grocery" />;
}
