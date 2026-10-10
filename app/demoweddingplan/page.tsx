import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("weddingplan");

export default function Page() {
  return <DemoPageView slug="weddingplan" />;
}
