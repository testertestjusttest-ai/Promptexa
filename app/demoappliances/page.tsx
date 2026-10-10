import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("appliances");

export default function Page() {
  return <DemoPageView slug="appliances" />;
}
