import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("chinese");

export default function Page() {
  return <DemoPageView slug="chinese" />;
}
