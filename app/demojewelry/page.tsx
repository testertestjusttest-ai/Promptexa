import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("jewelry");

export default function Page() {
  return <DemoPageView slug="jewelry" />;
}
