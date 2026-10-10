import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("realestate");

export default function Page() {
  return <DemoPageView slug="realestate" />;
}
