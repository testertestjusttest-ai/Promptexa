import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("juicebar");

export default function Page() {
  return <DemoPageView slug="juicebar" />;
}
