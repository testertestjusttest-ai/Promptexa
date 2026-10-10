import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("eventplan");

export default function Page() {
  return <DemoPageView slug="eventplan" />;
}
