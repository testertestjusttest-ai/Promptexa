import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("carwash");

export default function Page() {
  return <DemoPageView slug="carwash" />;
}
