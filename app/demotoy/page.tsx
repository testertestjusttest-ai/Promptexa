import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("toy");

export default function Page() {
  return <DemoPageView slug="toy" />;
}
