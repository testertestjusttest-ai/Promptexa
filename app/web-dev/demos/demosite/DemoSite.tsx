"use client";

/** DemoSite router — maps URL segments to the right page per layout. */

import Chrome from "./chrome";
import { useDemo } from "./store";
import {
  ShopHome, ShopAll, ShopCategory, ShopProduct, ShopCart, ShopCheckout,
  ShopSuccess, ShopTrack, ShopSearch, ShopOffers, ShopLogin, ShopSignup,
  ShopAccount, ShopOrders, ShopOrderDetail, ShopWallet, ShopAbout, ShopContact,
  ShopWishlist, ShopFaq, ShopPolicy, ShopDeals, ShopNew, ShopBestsellers,
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
  FinDeposit,
} from "./fintech-pages";
import {
  CasinoHome, SportsHome, SportPage, MatchDetail, LiveBetting, LiveMatchDetail,
  UpcomingMatches, Results, FuturesPage, BetSlip, MyBets, BetHistory, BettingRules, OddsGuide,
  CasinoLobby, SlotsList, SlotGame, LiveCasino, LiveGameDetail,
  RouletteGame, BlackjackGame, BaccaratGame, PokerGame, TeenPattiGame, AndarBaharGame, DragonTigerGame,
  CrashGame, AviatorGame, DiceGame, WheelGame, MinesGame, PlinkoGame, HiLoGame, CatalogLobby, SuperAceGame,
  GameHistory, Tournaments, TournamentDetail, Jackpots,
  CasinoLogin, CasinoSignup, CasinoWallet, DepositHome, DepositBkash, DepositNagad, DepositRocket, DepositCard,
  Withdraw, Transactions, Promotions, PromotionDetail, VipProgram, VipLevels, Referral,
  CasinoAccount, AccountSettings, Kyc, ResponsibleGaming,
  CasinoAbout, CasinoContact, CasinoFaq, Terms, Privacy, Announcements, Blog, BlogDetail, SupportCenter,
} from "./casino-pages";
import {
  CexHome, CexMarkets, CexSpot, CexFutures, CexP2P, CexP2PDetail, CexConvert,
  CexDepositCrypto, CexDepositFiat, CexWithdraw, CexWallet, CexSpotWallet,
  CexFuturesWallet, CexFundingWallet, CexTxHistory, CexSpotOrders, CexFuturesOrders,
  CexTradeHistory, CexLogin, CexSignup, Cex2FA, CexKyc, CexKycStatus, CexAccount,
  CexSecurity, CexApi, CexReferral, CexReferralDash, CexLaunchpad, CexLaunchpadDetail,
  CexEarn, CexEarnDetail, CexSavings, CexNft, CexNftDetail, CexAnnounce,
  CexAnnounceDetail, CexSupport, CexFaq, CexFees, CexApiDocs, CexTerms, CexPrivacy,
  CexAbout, CexContact, CexCareers, CexBlog, CexBlogDetail, CexAcademy,
  CexAcademyDetail, CexAlerts, CexWatchlist, CexPortfolio, CexTax, CexNotifs,
  CexCoinDetail,
} from "./crypto-exchange";
import { Empty, Page } from "./ui";
import { DemoAdmin } from "./demo-admin";
import { ClientAdmin } from "./client-admin";
import {
  BhHome, BhServices, BhServiceDetail, BhProducts, BhProductDetail, BhProcess,
  BhFactories, BhRfq, BhAbout, BhContact, BhLogin, BhSignup, BhAccount, BuyingAdmin,
} from "./buying-pages";

function NotFound() {
  return (
    <Page narrow>
      <Empty emoji="🔍" text="পেজটি পাওয়া যায়নি" />
    </Page>
  );
}

export default function DemoSite({ page }: { page: string[] }) {
  const { def, clientSlug } = useDemo();
  const [p0, p1, p2] = page.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  let body: React.ReactNode = <NotFound />;

  // Per-demo admin panel (all layouts) — full business admin in client mode
  if (p0 === "admin") body = clientSlug ? <ClientAdmin /> : def.layout === "buyinghouse" ? <BuyingAdmin /> : <DemoAdmin />;
  else if (def.layout === "buyinghouse") {
    if (!p0) body = <BhHome />;
    else if (p0 === "services") body = <BhServices />;
    else if (p0 === "s" && p1) body = <BhServiceDetail id={p1} />;
    else if (p0 === "products") body = <BhProducts />;
    else if (p0 === "p" && p1) body = <BhProductDetail id={p1} />;
    else if (p0 === "process") body = <BhProcess />;
    else if (p0 === "factories") body = <BhFactories />;
    else if (p0 === "rfq") body = <BhRfq />;
    else if (p0 === "about") body = <BhAbout />;
    else if (p0 === "contact") body = <BhContact />;
    else if (p0 === "login") body = <BhLogin />;
    else if (p0 === "signup") body = <BhSignup />;
    else if (p0 === "account") body = <BhAccount />;
  }
  else if (def.layout === "shop") {
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
    else if (p0 === "wishlist") body = <ShopWishlist />;
    else if (p0 === "faq") body = <ShopFaq />;
    else if (p0 === "shipping") body = <ShopPolicy kind="shipping" />;
    else if (p0 === "returns") body = <ShopPolicy kind="returns" />;
    else if (p0 === "privacy") body = <ShopPolicy kind="privacy" />;
    else if (p0 === "terms") body = <ShopPolicy kind="terms" />;
    else if (p0 === "deals") body = <ShopDeals />;
    else if (p0 === "new") body = <ShopNew />;
    else if (p0 === "bestsellers") body = <ShopBestsellers />;
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
    else if (p0 === "deposit") body = <FinDeposit />;
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
    else if (p0 === "deposit") body = <FinDeposit />;
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
    else if (p0 === "deposit") body = <FinDeposit />;
    else if (p0 === "login") body = <WalletLogin />;
    else if (p0 === "signup") body = <WalletSignup />;
    else if (p0 === "account") body = <WalletAccount />;
    else if (p0 === "about") body = <WalletAbout />;
    else if (p0 === "contact") body = <WalletContact />;
  } else if (def.layout === "casino") {
    if (!p0) body = <CasinoHome />;
    // sports
    else if (p0 === "sports" && p1) body = <SportPage sport={p1} />;
    else if (p0 === "sports") body = <SportsHome />;
    else if (p0 === "match" && p1) body = <MatchDetail id={p1} />;
    else if (p0 === "live" && p1) body = <LiveMatchDetail id={p1} />;
    else if (p0 === "live") body = <LiveBetting />;
    else if (p0 === "upcoming") body = <UpcomingMatches />;
    else if (p0 === "results") body = <Results />;
    else if (p0 === "sports-futures") body = <FuturesPage />;
    else if (p0 === "betslip") body = <BetSlip />;
    else if (p0 === "my-bets") body = <MyBets />;
    else if (p0 === "bet-history") body = <BetHistory />;
    else if (p0 === "betting-rules") body = <BettingRules />;
    else if (p0 === "odds-guide") body = <OddsGuide />;
    // casino games
    else if (p0 === "casino" && p1 === "slots" && p2) body = <SlotGame id={p2} />;
    else if (p0 === "casino" && p1 === "slots") body = <SlotsList />;
    else if (p0 === "casino" && p1 === "live" && p2) body = <LiveGameDetail id={p2} />;
    else if (p0 === "casino" && p1 === "live") body = <LiveCasino />;
    else if (p0 === "casino" && p1 === "table" && p2 === "roulette") body = <RouletteGame />;
    else if (p0 === "casino" && p1 === "table" && p2 === "blackjack") body = <BlackjackGame />;
    else if (p0 === "casino" && p1 === "table" && p2 === "baccarat") body = <BaccaratGame />;
    else if (p0 === "casino" && p1 === "table" && p2 === "poker") body = <PokerGame />;
    else if (p0 === "casino" && p1 === "desi" && p2 === "teen-patti") body = <TeenPattiGame />;
    else if (p0 === "casino" && p1 === "desi" && p2 === "andar-bahar") body = <AndarBaharGame />;
    else if (p0 === "casino" && p1 === "desi" && p2 === "dragon-tiger") body = <DragonTigerGame />;
    else if (p0 === "casino" && p1 === "crash" && p2 === "crash") body = <CrashGame />;
    else if (p0 === "casino" && p1 === "crash" && p2 === "aviator") body = <AviatorGame />;
    else if (p0 === "casino" && p1 === "crash" && p2 === "dice") body = <DiceGame />;
    else if (p0 === "casino" && p1 === "crash" && p2 === "wheel") body = <WheelGame />;
    else if (p0 === "casino" && p1 === "history") body = <GameHistory />;
    else if (p0 === "casino" && p1 === "tournaments" && p2) body = <TournamentDetail id={p2} />;
    else if (p0 === "casino" && p1 === "tournaments") body = <Tournaments />;
    else if (p0 === "casino" && p1 === "jackpots") body = <Jackpots />;
    else if (p0 === "games") body = <CatalogLobby />;
    else if (p0 === "slots" && p1) body = <SlotGame id={p1} />;
    else if (p0 === "slots") body = <CatalogLobby />;
    else if (p0 === "mines") body = <MinesGame />;
    else if (p0 === "plinko") body = <PlinkoGame />;
    else if (p0 === "hilo") body = <HiLoGame />;
    else if (p0 === "superace") body = <SuperAceGame />;
    else if (p0 === "crash") body = <CrashGame />;
    else if (p0 === "aviator") body = <AviatorGame />;
    else if (p0 === "dice") body = <DiceGame />;
    else if (p0 === "wheel") body = <WheelGame />;
    else if (p0 === "casino") body = <CasinoLobby />;
    // account & wallet
    else if (p0 === "login") body = <CasinoLogin />;
    else if (p0 === "signup") body = <CasinoSignup />;
    else if (p0 === "wallet") body = <CasinoWallet />;
    else if (p0 === "deposit" && p1 === "bkash") body = <DepositBkash />;
    else if (p0 === "deposit" && p1 === "nagad") body = <DepositNagad />;
    else if (p0 === "deposit" && p1 === "rocket") body = <DepositRocket />;
    else if (p0 === "deposit" && p1 === "card") body = <DepositCard />;
    else if (p0 === "deposit") body = <DepositHome />;
    else if (p0 === "withdraw") body = <Withdraw />;
    else if (p0 === "transactions") body = <Transactions />;
    else if (p0 === "promotions" && p1) body = <PromotionDetail id={p1} />;
    else if (p0 === "promotions") body = <Promotions />;
    else if (p0 === "vip" && p1 === "levels") body = <VipLevels />;
    else if (p0 === "vip") body = <VipProgram />;
    else if (p0 === "referral") body = <Referral />;
    else if (p0 === "account" && p1 === "settings") body = <AccountSettings />;
    else if (p0 === "account" && p1 === "kyc") body = <Kyc />;
    else if (p0 === "account") body = <CasinoAccount />;
    else if (p0 === "responsible-gaming") body = <ResponsibleGaming />;
    // info & support
    else if (p0 === "about") body = <CasinoAbout />;
    else if (p0 === "contact") body = <CasinoContact />;
    else if (p0 === "faq") body = <CasinoFaq />;
    else if (p0 === "terms") body = <Terms />;
    else if (p0 === "privacy") body = <Privacy />;
    else if (p0 === "announcements") body = <Announcements />;
    else if (p0 === "blog" && p1) body = <BlogDetail id={p1} />;
    else if (p0 === "blog") body = <Blog />;
    else if (p0 === "support") body = <SupportCenter />;
  } else if (def.layout === "crypto-exchange") {
    if (!p0) body = <CexHome />;
    else if (p0 === "markets") body = <CexMarkets />;
    else if (p0 === "trade") body = <CexSpot pair={p1} />;
    else if (p0 === "futures") body = <CexFutures pair={p1} />;
    else if (p0 === "p2p" && p1) body = <CexP2PDetail id={p1} />;
    else if (p0 === "p2p") body = <CexP2P />;
    else if (p0 === "convert") body = <CexConvert />;
    else if (p0 === "deposit") body = <CexDepositCrypto />;
    else if (p0 === "deposit-fiat") body = <CexDepositFiat />;
    else if (p0 === "withdraw") body = <CexWithdraw />;
    else if (p0 === "wallet" && p1 === "spot") body = <CexSpotWallet />;
    else if (p0 === "wallet" && p1 === "futures") body = <CexFuturesWallet />;
    else if (p0 === "wallet" && p1 === "funding") body = <CexFundingWallet />;
    else if (p0 === "wallet") body = <CexWallet />;
    else if (p0 === "history") body = <CexTxHistory />;
    else if (p0 === "orders" && p1 === "spot") body = <CexSpotOrders />;
    else if (p0 === "orders" && p1 === "futures") body = <CexFuturesOrders />;
    else if (p0 === "trades") body = <CexTradeHistory />;
    else if (p0 === "login") body = <CexLogin />;
    else if (p0 === "signup") body = <CexSignup />;
    else if (p0 === "2fa") body = <Cex2FA />;
    else if (p0 === "kyc") body = <CexKyc />;
    else if (p0 === "kyc-status") body = <CexKycStatus />;
    else if (p0 === "account") body = <CexAccount />;
    else if (p0 === "security") body = <CexSecurity />;
    else if (p0 === "api") body = <CexApi />;
    else if (p0 === "referral") body = <CexReferral />;
    else if (p0 === "referral-dash") body = <CexReferralDash />;
    else if (p0 === "launchpad" && p1) body = <CexLaunchpadDetail id={p1} />;
    else if (p0 === "launchpad") body = <CexLaunchpad />;
    else if (p0 === "earn" && p1) body = <CexEarnDetail id={p1} />;
    else if (p0 === "earn") body = <CexEarn />;
    else if (p0 === "savings") body = <CexSavings />;
    else if (p0 === "nft" && p1) body = <CexNftDetail id={p1} />;
    else if (p0 === "nft") body = <CexNft />;
    else if (p0 === "announcements") body = <CexAnnounce />;
    else if (p0 === "announcement" && p1) body = <CexAnnounceDetail id={p1} />;
    else if (p0 === "support") body = <CexSupport />;
    else if (p0 === "faq") body = <CexFaq />;
    else if (p0 === "fees") body = <CexFees />;
    else if (p0 === "api-docs") body = <CexApiDocs />;
    else if (p0 === "terms") body = <CexTerms />;
    else if (p0 === "privacy") body = <CexPrivacy />;
    else if (p0 === "about") body = <CexAbout />;
    else if (p0 === "contact") body = <CexContact />;
    else if (p0 === "careers") body = <CexCareers />;
    else if (p0 === "blog" && p1) body = <CexBlogDetail id={p1} />;
    else if (p0 === "blog") body = <CexBlog />;
    else if (p0 === "academy" && p1) body = <CexAcademyDetail id={p1} />;
    else if (p0 === "academy") body = <CexAcademy />;
    else if (p0 === "alerts") body = <CexAlerts />;
    else if (p0 === "watchlist") body = <CexWatchlist />;
    else if (p0 === "portfolio") body = <CexPortfolio />;
    else if (p0 === "tax") body = <CexTax />;
    else if (p0 === "notifications") body = <CexNotifs />;
    else if (p0 === "coin" && p1) body = <CexCoinDetail code={p1} />;
  }

  return <Chrome>{body}</Chrome>;
}
