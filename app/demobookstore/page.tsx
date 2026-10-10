import DemoPageView, { demoMetadata } from "../web-dev/demo/DemoPageView";

export const metadata = demoMetadata("bookstore");

export default function Page() {
  return <DemoPageView slug="bookstore" />;
}
