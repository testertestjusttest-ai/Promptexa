"use client";

/**
 * DemoSite store — auth, cart, wallet, orders, bookings.
 * 100% browser-local (localStorage), namespaced per demo slug.
 * Demo transactions NEVER touch the real DigiPlyra database or admin panel.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { DemoSiteDef } from "./types";

export interface DemoUser {
  name: string;
  phone: string;
  pass: string;
  address: string;
}

export interface CartLine {
  id: string;
  n: string;
  p: number;
  e: string;
  qty: number;
}

export interface OrderItem {
  id: string;
  n: string;
  p: number;
  e: string;
  qty: number;
}

export interface DemoOrderRec {
  id: string;
  items: OrderItem[];
  total: number;
  name: string;
  phone: string;
  address: string;
  pay: string;
  date: number;
  status: string;
  userPhone: string;
}

export interface DemoBookingRec {
  id: string;
  itemName: string;
  itemEmoji: string;
  date: string;
  slot: string;
  name: string;
  phone: string;
  total: number;
  status: string;
  createdAt: number;
  userPhone: string;
}

export interface Tx {
  date: number;
  label: string;
  amount: number;
}

export interface DemoInvestmentRec {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  roi: number;
  duration: string;
  date: number;
  status: string;
  userPhone: string;
}

export interface DemoExchangeRec {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  name: string;
  phone: string;
  date: number;
  status: string;
  userPhone: string;
}

export interface DemoCoinTx {
  id: string;
  kind: "send" | "receive";
  coin: string;
  amount: number;
  addr: string;
  date: number;
  userPhone: string;
}

export interface DemoDepositRec {
  id: string;
  amount: number;
  method: string;
  trxId: string;
  date: number;
  status: string;
  userPhone: string;
}

/** Casino: sports/casino bet record. */
export interface DemoBetRec {
  id: string;
  kind: "sports" | "live";
  sport: string;
  match: string;
  selection: string;
  odds: number;
  stake: number;
  potential: number;
  date: number;
  status: "পেন্ডিং" | "জিতেছেন" | "হেরেছেন";
  userPhone: string;
}

/** Casino: casino game round record. */
export interface DemoGameRec {
  id: string;
  game: string;
  bet: number;
  win: number;
  date: number;
  userPhone: string;
}

function read<T>(k: string, fb: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

function orderId(prefix: string) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const K = (slug: string, rest: string) => `dmsite:${slug}:${rest}`;

export interface DemoStore {
  user: DemoUser | null;
  signup: (name: string, phone: string, pass: string) => string | null;
  login: (phone: string, pass: string) => string | null;
  logout: () => void;
  saveAddress: (a: string) => void;
  cart: CartLine[];
  addToCart: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wallet: number;
  txs: Tx[];
  topUp: (amount: number) => void;
  payWithWallet: (amount: number, label: string) => boolean;
  orders: DemoOrderRec[];
  placeOrder: (o: Omit<DemoOrderRec, "id" | "date" | "status" | "userPhone">) => DemoOrderRec;
  bookings: DemoBookingRec[];
  placeBooking: (b: Omit<DemoBookingRec, "id" | "createdAt" | "status" | "userPhone">) => DemoBookingRec;
  investments: DemoInvestmentRec[];
  placeInvestment: (p: Omit<DemoInvestmentRec, "id" | "date" | "status" | "userPhone">) => DemoInvestmentRec;
  exchanges: DemoExchangeRec[];
  placeExchange: (e: Omit<DemoExchangeRec, "id" | "date" | "status" | "userPhone">) => DemoExchangeRec;
  coinTxs: DemoCoinTx[];
  placeCoinTx: (t: Omit<DemoCoinTx, "id" | "date" | "userPhone">) => DemoCoinTx;
  deposits: DemoDepositRec[];
  placeDeposit: (d: Omit<DemoDepositRec, "id" | "date" | "status" | "userPhone">) => DemoDepositRec;
  bets: DemoBetRec[];
  placeBet: (b: Omit<DemoBetRec, "id" | "date" | "status" | "userPhone">) => DemoBetRec;
  settleBet: (id: string, won: boolean) => void;
  gameHistory: DemoGameRec[];
  placeGame: (g: Omit<DemoGameRec, "id" | "date" | "userPhone">) => DemoGameRec;
  custom: DemoCustom;
  saveCustom: (c: Partial<DemoCustom>) => void;
  resetCustom: () => void;
}

const Ctx = createContext<{ def: DemoSiteDef; base: string; store: DemoStore; clientSlug?: string } | null>(null);

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo outside DemositeProvider");
  return v;
}

export interface DemoCustom {
  theme?: string;
  accent?: string;
  siteName?: string;
  logoEmoji?: string;
  heroTitle?: string;
  heroSub?: string;
  dark?: boolean;
  casinoRtp?: number;
  casinoMinBet?: number;
  casinoMaxBet?: number;
  casinoBanners?: unknown;
}

function readCustomKey(key: string): DemoCustom {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as DemoCustom) : {};
  } catch {
    return {};
  }
}

export function DemositeProvider({ slug, def, children, clientSlug, initialCustom, baseOverride }: {
  slug: string;
  def: DemoSiteDef;
  children: React.ReactNode;
  /** Multi-tenant client mode: namespaces all storage keys per client. */
  clientSlug?: string;
  /** Server-provided overrides (from client_sites DB) — merged under local custom. */
  initialCustom?: DemoCustom;
  /** Override the URL base (e.g. "" for custom domains). */
  baseOverride?: string;
}) {
  // In client mode, storage is namespaced per client so each customer's data is isolated.
  const ns = clientSlug ? `client:${clientSlug}` : `dmsite:${slug}`;
  const KK = (rest: string) => `${ns}:${rest}`;
  const base = baseOverride ?? (clientSlug ? `/c/${clientSlug}` : `/demo${slug}`);
  const ident = () => {
    const s = read<string | null>(KK("session"), null);
    return s || "guest";
  };

  const [user, setUser] = useState<DemoUser | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wallet, setWallet] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [orders, setOrders] = useState<DemoOrderRec[]>([]);
  const [bookings, setBookings] = useState<DemoBookingRec[]>([]);
  const [investments, setInvestments] = useState<DemoInvestmentRec[]>([]);
  const [exchanges, setExchanges] = useState<DemoExchangeRec[]>([]);
  const [coinTxs, setCoinTxs] = useState<DemoCoinTx[]>([]);
  const [deposits, setDeposits] = useState<DemoDepositRec[]>([]);
  const [bets, setBets] = useState<DemoBetRec[]>([]);
  const [gameHistory, setGameHistory] = useState<DemoGameRec[]>([]);
  const [custom, setCustom] = useState<DemoCustom>(() => ({ ...(initialCustom ?? {}) }));

  // Merge admin customizations (theme, accent, names) into the def
  const liveDef: DemoSiteDef = useMemo(() => ({
    ...def,
    theme: (custom.theme as DemoSiteDef["theme"]) ?? def.theme,
    accent: custom.accent ?? def.accent,
    name: custom.siteName ?? def.name,
    logoEmoji: custom.logoEmoji ?? def.logoEmoji,
    heroTitle: custom.heroTitle ?? def.heroTitle,
    heroSub: custom.heroSub ?? def.heroSub,
    dark: custom.dark ?? def.dark,
  }), [def, custom]);

  const loadIdentity = useCallback(() => {
    const id = ident();
    // Users are stored in the "users" map (keyed by phone), not a separate user:{id} key.
    const users = read<Record<string, DemoUser>>(KK("users"), {});
    const u = id === "guest" ? null : (users[id] ?? null);
    setUser(u);
    setCart(read(KK(`cart:${id}`), []));
    setWallet(read(KK(`wallet:${id}`), 0));
    setTxs(read(KK(`txs:${id}`), []));
  }, [slug]);

  useEffect(() => {
    setOrders(read(KK("orders"), []));
    setBookings(read(KK("bookings"), []));
    setInvestments(read(KK("investments"), []));
    setExchanges(read(KK("exchanges"), []));
    setCoinTxs(read(KK("cointxs"), []));
    setDeposits(read(KK("deposits"), []));
    setBets(read(KK("bets"), []));
    setGameHistory(read(KK("gamehistory"), []));
    setCustom({ ...(initialCustom ?? {}), ...readCustomKey(KK("custom")) });
    loadIdentity();
  }, [slug, loadIdentity]);

  const persistCart = (c: CartLine[]) => {
    setCart(c);
    write(KK(`cart:${ident()}`), c);
  };

  const store: DemoStore = useMemo(() => {
    const me = () => ident();
    return {
      user,
      signup: (name, phone, pass) => {
        name = name.trim();
        phone = phone.trim();
        if (name.length < 3) return "আপনার নাম লিখুন";
        if (!/^01[3-9]\d{8}$/.test(phone)) return "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন";
        if (pass.length < 4) return "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের দিন";
        const users = read<Record<string, DemoUser>>(KK("users"), {});
        if (users[phone]) return "এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে — লগইন করুন";
        users[phone] = { name, phone, pass, address: "" };
        write(KK("users"), users);
        write(KK("session"), phone);
        // merge guest cart → new account
        const guestCart = read<CartLine[]>(KK("cart:guest"), []);
        write(KK(`cart:${phone}`), guestCart);
        write(KK("cart:guest"), []);
        // signup bonus
        write(KK(`wallet:${phone}`), 5000);
        write(KK(`txs:${phone}`), [{ date: Date.now(), label: "🎁 সাইনআপ বোনাস", amount: 5000 }]);
        loadIdentity();
        return null;
      },
      login: (phone, pass) => {
        phone = phone.trim();
        const users = read<Record<string, DemoUser>>(KK("users"), {});
        const u = users[phone];
        if (!u) return "এই নম্বরে অ্যাকাউন্ট নেই — সাইন আপ করুন";
        if (u.pass !== pass) return "পাসওয়ার্ড ভুল হয়েছে";
        write(KK("session"), phone);
        const guestCart = read<CartLine[]>(KK("cart:guest"), []);
        if (guestCart.length) {
          const mine = read<CartLine[]>(KK(`cart:${phone}`), []);
          const merged = [...mine];
          for (const g of guestCart) {
            const f = merged.find((m) => m.id === g.id);
            if (f) f.qty += g.qty;
            else merged.push(g);
          }
          write(KK(`cart:${phone}`), merged);
          write(KK("cart:guest"), []);
        }
        loadIdentity();
        return null;
      },
      logout: () => {
        try {
          localStorage.removeItem(KK("session"));
        } catch {}
        loadIdentity();
      },
      saveAddress: (a) => {
        const id = me();
        if (id === "guest") return;
        const u = read<DemoUser | null>(KK(`user:${id}`), null);
        if (u) {
          u.address = a;
          write(KK(`user:${id}`), u);
          setUser(u);
        }
      },
      cart,
      addToCart: (line, qty = 1) => {
        const c = [...cart];
        const f = c.find((x) => x.id === line.id);
        if (f) f.qty = Math.min(99, f.qty + qty);
        else c.push({ ...line, qty });
        persistCart(c);
      },
      setQty: (id, qty) => {
        if (qty <= 0) {
          persistCart(cart.filter((x) => x.id !== id));
          return;
        }
        persistCart(cart.map((x) => (x.id === id ? { ...x, qty: Math.min(99, qty) } : x)));
      },
      removeLine: (id) => persistCart(cart.filter((x) => x.id !== id)),
      clearCart: () => persistCart([]),
      cartCount: cart.reduce((s, x) => s + x.qty, 0),
      cartTotal: cart.reduce((s, x) => s + x.p * x.qty, 0),
      wallet,
      txs,
      topUp: (amount) => {
        const id = me();
        const w = wallet + amount;
        const t = [{ date: Date.now(), label: "💳 ওয়ালেট টপ-আপ (ডেমো)", amount }, ...txs].slice(0, 30);
        setWallet(w);
        setTxs(t);
        write(KK(`wallet:${id}`), w);
        write(KK(`txs:${id}`), t);
      },
      payWithWallet: (amount, label) => {
        if (wallet < amount) return false;
        const id = me();
        const w = wallet - amount;
        const t = [{ date: Date.now(), label, amount: -amount }, ...txs].slice(0, 30);
        setWallet(w);
        setTxs(t);
        write(KK(`wallet:${id}`), w);
        write(KK(`txs:${id}`), t);
        return true;
      },
      orders,
      placeOrder: (o) => {
        const rec: DemoOrderRec = { ...o, id: orderId("DM"), date: Date.now(), status: "প্রসেসিং", userPhone: me() };
        const all = [rec, ...orders].slice(0, 50);
        setOrders(all);
        write(KK("orders"), all);
        persistCart([]);
        return rec;
      },
      bookings,
      placeBooking: (b) => {
        const rec: DemoBookingRec = { ...b, id: orderId("BK"), createdAt: Date.now(), status: "কনফার্মড", userPhone: me() };
        const all = [rec, ...bookings].slice(0, 50);
        setBookings(all);
        write(KK("bookings"), all);
        return rec;
      },
      investments,
      placeInvestment: (p) => {
        const rec: DemoInvestmentRec = { ...p, id: orderId("INV"), date: Date.now(), status: "সক্রিয়", userPhone: me() };
        const all = [rec, ...investments].slice(0, 50);
        setInvestments(all);
        write(KK("investments"), all);
        return rec;
      },
      exchanges,
      placeExchange: (e) => {
        const rec: DemoExchangeRec = { ...e, id: orderId("EX"), date: Date.now(), status: "প্রসেসিং", userPhone: me() };
        const all = [rec, ...exchanges].slice(0, 50);
        setExchanges(all);
        write(KK("exchanges"), all);
        return rec;
      },
      coinTxs,
      placeCoinTx: (t) => {
        const rec: DemoCoinTx = { ...t, id: orderId("TX"), date: Date.now(), userPhone: me() };
        const all = [rec, ...coinTxs].slice(0, 50);
        setCoinTxs(all);
        write(KK("cointxs"), all);
        return rec;
      },
      deposits,
      placeDeposit: (d) => {
        const rec: DemoDepositRec = { ...d, id: orderId("DP"), date: Date.now(), status: "পেন্ডিং", userPhone: me() };
        const all = [rec, ...deposits].slice(0, 50);
        setDeposits(all);
        write(KK("deposits"), all);
        return rec;
      },
      bets,
      placeBet: (b) => {
        const rec: DemoBetRec = { ...b, id: orderId("BET"), date: Date.now(), status: "পেন্ডিং", userPhone: me() };
        const all = [rec, ...bets].slice(0, 100);
        setBets(all);
        write(KK("bets"), all);
        return rec;
      },
      settleBet: (id, won) => {
        const all = bets.map((b) => {
          if (b.id !== id || b.status !== "পেন্ডিং") return b;
          return { ...b, status: (won ? "জিতেছেন" : "হেরেছেন") as DemoBetRec["status"] };
        });
        setBets(all);
        write(KK("bets"), all);
        const b = bets.find((x) => x.id === id);
        if (won && b) {
          const w = wallet + Math.round(b.potential);
          setWallet(w);
          write(KK(`wallet:${me()}`), w);
          const t = [{ date: Date.now(), label: `🏆 বাজি জয়: ${b.match}`, amount: Math.round(b.potential) }, ...txs].slice(0, 30);
          setTxs(t);
          write(KK(`txs:${me()}`), t);
        }
      },
      gameHistory,
      placeGame: (g) => {
        const rec: DemoGameRec = { ...g, id: orderId("GM"), date: Date.now(), userPhone: me() };
        const all = [rec, ...gameHistory].slice(0, 100);
        setGameHistory(all);
        write(KK("gamehistory"), all);
        return rec;
      },
      custom,
      saveCustom: (c) => {
        const next = { ...custom, ...c };
        setCustom(next);
        write(KK("custom"), next);
      },
      resetCustom: () => {
        setCustom({});
        try { localStorage.removeItem(KK("custom")); } catch {}
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user, cart, wallet, txs, orders, bookings, investments, exchanges, coinTxs, deposits, bets, gameHistory, custom, loadIdentity]);

  return <Ctx.Provider value={{ def: liveDef, base, store, clientSlug }}>{children}</Ctx.Provider>;
}
