import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("restaurant");

export default function Page() {
  return <DemoPageView slug="restaurant" />;
}
