import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("artist");

export default function Page() {
  return <DemoPageView slug="artist" />;
}
