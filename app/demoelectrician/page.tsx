import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("electrician");

export default function Page() {
  return <DemoPageView slug="electrician" />;
}
