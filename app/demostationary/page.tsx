import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("stationary");

export default function Page() {
  return <DemoPageView slug="stationary" />;
}
