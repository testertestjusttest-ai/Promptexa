import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("news");

export default function Page() {
  return <DemoPageView slug="news" />;
}
