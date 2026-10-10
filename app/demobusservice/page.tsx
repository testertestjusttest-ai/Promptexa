import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("busservice");

export default function Page() {
  return <DemoPageView slug="busservice" />;
}
