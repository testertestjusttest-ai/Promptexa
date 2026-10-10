import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("travel");

export default function Page() {
  return <DemoPageView slug="travel" />;
}
