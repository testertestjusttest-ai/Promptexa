import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("interior");

export default function Page() {
  return <DemoPageView slug="interior" />;
}
