import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("plumber");

export default function Page() {
  return <DemoPageView slug="plumber" />;
}
