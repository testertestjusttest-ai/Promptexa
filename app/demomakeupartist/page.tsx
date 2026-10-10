import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("makeupartist");

export default function Page() {
  return <DemoPageView slug="makeupartist" />;
}
