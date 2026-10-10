import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("fashion");

export default function Page() {
  return <DemoPageView slug="fashion" />;
}
