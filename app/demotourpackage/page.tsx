import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("tourpackage");

export default function Page() {
  return <DemoPageView slug="tourpackage" />;
}
