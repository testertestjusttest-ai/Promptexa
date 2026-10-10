import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("chef");

export default function Page() {
  return <DemoPageView slug="chef" />;
}
