import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("yoga");

export default function Page() {
  return <DemoPageView slug="yoga" />;
}
