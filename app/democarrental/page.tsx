import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("carrental");

export default function Page() {
  return <DemoPageView slug="carrental" />;
}
