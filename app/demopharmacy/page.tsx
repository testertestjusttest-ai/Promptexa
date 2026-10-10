import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("pharmacy");

export default function Page() {
  return <DemoPageView slug="pharmacy" />;
}
