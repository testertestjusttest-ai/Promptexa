import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("biriyani");

export default function Page() {
  return <DemoPageView slug="biriyani" />;
}
