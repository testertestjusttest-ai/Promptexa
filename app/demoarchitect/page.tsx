import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("architect");

export default function Page() {
  return <DemoPageView slug="architect" />;
}
