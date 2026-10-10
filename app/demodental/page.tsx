import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("dental");

export default function Page() {
  return <DemoPageView slug="dental" />;
}
