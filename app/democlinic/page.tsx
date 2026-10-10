import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("clinic");

export default function Page() {
  return <DemoPageView slug="clinic" />;
}
