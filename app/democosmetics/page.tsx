import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("cosmetics");

export default function Page() {
  return <DemoPageView slug="cosmetics" />;
}
