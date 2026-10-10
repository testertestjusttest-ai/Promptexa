import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("tutor");

export default function Page() {
  return <DemoPageView slug="tutor" />;
}
