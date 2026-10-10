import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("salon");

export default function Page() {
  return <DemoPageView slug="salon" />;
}
