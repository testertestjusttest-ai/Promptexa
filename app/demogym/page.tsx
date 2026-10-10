import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("gym");

export default function Page() {
  return <DemoPageView slug="gym" />;
}
