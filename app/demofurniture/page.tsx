import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("furniture");

export default function Page() {
  return <DemoPageView slug="furniture" />;
}
