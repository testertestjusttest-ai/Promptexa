import FaqClient from "./FaqClient";

export const metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about DigiPlyra — website packages and pricing, delivery time, payments, earnings and rewards, ID marketplace safety, and account help. Type your question for an instant answer.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/faq",
    title: "Frequently Asked Questions — DigiPlyra",
    description:
      "Answers about DigiPlyra — website packages and pricing, delivery time, payments, earnings and rewards, ID marketplace safety, and account help.",
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
