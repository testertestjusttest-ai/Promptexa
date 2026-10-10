import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("portfolio");

export default function Page() {
  return <DemoPageView slug="portfolio" />;
}
