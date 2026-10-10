import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("mobilestore");

export default function Page() {
  return <DemoPageView slug="mobilestore" />;
}
