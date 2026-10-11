"use client";

/** DemoSite router — maps URL segments to the right page per layout. */

import Chrome from "./chrome";
import { useDemo } from "./store";
import {
  ShopHome, ShopAll, ShopCategory, ShopProduct, ShopCart, ShopCheckout,
  ShopSuccess, ShopTrack, ShopSearch, ShopOffers, ShopLogin, ShopSignup,
  ShopAccount, ShopOrders, ShopOrderDetail, ShopWallet, ShopAbout, ShopContact,
} from "./shop-pages";
import {
  SvcHome, SvcList, SvcDetail, SvcBook, SvcBookings, SvcReviews,
  SvcLogin, SvcSignup, SvcAccount, SvcAbout, SvcContact,
  GalHome, GalGrid, GalDetail, GalPricing, GalBook,
  GalLogin, GalSignup, GalAccount, GalAbout, GalContact,
  BookHome, BookStays, BookDetail, BookFlow, BookMy,
  BookLogin, BookSignup, BookAccount, BookWallet, BookAbout, BookContact,
  NewsHome, NewsCat, NewsArticle, NewsSearch, NewsAbout, NewsContact,
} from "./other-pages";
import {
  InvestHome, InvestPlans, InvestDetail, InvestSuccess, InvestDashboard, InvestHow,
  InvestLogin, InvestSignup, InvestAccount, InvestAbout, InvestContact,
  ExchangeHome, ExchangeRates, ExchangeFlow, ExchangeSuccess, ExchangeTrack,
  ExchangeLogin, ExchangeSignup, ExchangeAccount, ExchangeAbout, ExchangeContact,
  WalletHome, WalletDash, WalletSend, WalletReceive,
  WalletLogin, WalletSignup, WalletAccount, WalletAbout, WalletContact,
} from "./fintech-pages";
import { Empty, Page } from "./ui";

function NotFound() {
  return (
    <Page narrow>
      <Empty emoji="🔍" text="পেজটি পাওয়া যায়নি" />
    </Page>
  );
}

export default function DemoSite({ page }: { page: string[] }) {
  const { def } = useDemo();
  const [p0, p1] = page.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  let body: React.ReactNode = <NotFound />;

  if (def.layout === "shop") {
    if (!p0) body = <ShopHome />;
    else if (p0 === "shop") body = <ShopAll />;
    else if (p0 === "c" && p1) body = <ShopCategory cat={p1} />;
    else if (p0 === "p" && p1) body = <ShopProduct id={p1} />;
    else if (p0 === "cart") body = <ShopCart />;
    else if (p0 === "checkout") body = <ShopCheckout />;
    else if (p0 === "success" && p1) body = <ShopSuccess id={p1} />;
    else if (p0 === "track") body = <ShopTrack />;
    else if (p0 === "search") body = <ShopSearch />;
    else if (p0 === "offers") body = <ShopOffers />;
    else if (p0 === "login") body = <ShopLogin />;
    else if (p0 === "signup") body = <ShopSignup />;
    else if (p0 === "account") body = <ShopAccount />;
    else if (p0 === "orders" && p1) body = <ShopOrderDetail id={p1} />;
    else if (p0 === "orders") body = <ShopOrders />;
    else if (p0 === "wallet") body = <ShopWallet />;
    else if (p0 === "about") body = <ShopAbout />;
    else if (p0 === "contact") body = <ShopContact />;
  } else if (def.layout === "service") {
    if (!p0) body = <SvcHome />;
    else if (p0 === "services") body = <SvcList />;
    else if (p0 === "s" && p1) body = <SvcDetail id={p1} />;
    else if (p0 === "book" && p1) body = <SvcBook id={p1} />;
    else if (p0 === "my-bookings") body = <SvcBookings />;
    else if (p0 === "reviews") body = <SvcReviews />;
    else if (p0 === "login") body = <SvcLogin />;
    else if (p0 === "signup") body = <SvcSignup />;
    else if (p0 === "account") body = <SvcAccount />;
    else if (p0 === "about") body = <SvcAbout />;
    else if (p0 === "contact") body = <SvcContact />;
  } else if (def.layout === "gallery") {
    if (!p0) body = <GalHome />;
    else if (p0 === "gallery") body = <GalGrid />;
    else if (p0 === "g" && p1) body = <GalDetail id={p1} />;
    else if (p0 === "pricing") body = <GalPricing />;
    else if (p0 === "book") body = <GalBook />;
    else if (p0 === "my-bookings") body = <SvcBookings />;
    else if (p0 === "login") body = <GalLogin />;
    else if (p0 === "signup") body = <GalSignup />;
    else if (p0 === "account") body = <GalAccount />;
    else if (p0 === "about") body = <GalAbout />;
    else if (p0 === "contact") body = <GalContact />;
  } else if (def.layout === "booking") {
    if (!p0) body = <BookHome />;
    else if (p0 === "stays") body = <BookStays />;
    else if (p0 === "h" && p1) body = <BookDetail id={p1} />;
    else if (p0 === "book" && p1) body = <BookFlow id={p1} />;
    else if (p0 === "my-bookings") body = <BookMy />;
    else if (p0 === "login") body = <BookLogin />;
    else if (p0 === "signup") body = <BookSignup />;
    else if (p0 === "account") body = <BookAccount />;
    else if (p0 === "wallet") body = <BookWallet />;
    else if (p0 === "about") body = <BookAbout />;
    else if (p0 === "contact") body = <BookContact />;
  } else if (def.layout === "news") {
    if (!p0) body = <NewsHome />;
    else if (p0 === "cat" && p1) body = <NewsCat cat={p1} />;
    else if (p0 === "a" && p1) body = <NewsArticle id={p1} />;
    else if (p0 === "search") body = <NewsSearch />;
    else if (p0 === "about") body = <NewsAbout />;
    else if (p0 === "contact") body = <NewsContact />;
  } else if (def.layout === "invest") {
    if (!p0) body = <InvestHome />;
    else if (p0 === "plans") body = <InvestPlans />;
    else if (p0 === "plan" && p1) body = <InvestDetail id={p1} />;
    else if (p0 === "success" && p1) body = <InvestSuccess id={p1} />;
    else if (p0 === "dashboard") body = <InvestDashboard />;
    else if (p0 === "how") body = <InvestHow />;
    else if (p0 === "login") body = <InvestLogin />;
    else if (p0 === "signup") body = <InvestSignup />;
    else if (p0 === "account") body = <InvestAccount />;
    else if (p0 === "about") body = <InvestAbout />;
    else if (p0 === "contact") body = <InvestContact />;
  } else if (def.layout === "exchange") {
    if (!p0) body = <ExchangeHome />;
    else if (p0 === "exchange") body = <ExchangeFlow />;
    else if (p0 === "rates") body = <ExchangeRates />;
    else if (p0 === "success" && p1) body = <ExchangeSuccess id={p1} />;
    else if (p0 === "track") body = <ExchangeTrack />;
    else if (p0 === "login") body = <ExchangeLogin />;
    else if (p0 === "signup") body = <ExchangeSignup />;
    else if (p0 === "account") body = <ExchangeAccount />;
    else if (p0 === "about") body = <ExchangeAbout />;
    else if (p0 === "contact") body = <ExchangeContact />;
  } else if (def.layout === "wallet") {
    if (!p0) body = <WalletHome />;
    else if (p0 === "wallet") body = <WalletDash />;
    else if (p0 === "send") body = <WalletSend />;
    else if (p0 === "receive") body = <WalletReceive />;
    else if (p0 === "login") body = <WalletLogin />;
    else if (p0 === "signup") body = <WalletSignup />;
    else if (p0 === "account") body = <WalletAccount />;
    else if (p0 === "about") body = <WalletAbout />;
    else if (p0 === "contact") body = <WalletContact />;
  }

  return <Chrome>{body}</Chrome>;
}
