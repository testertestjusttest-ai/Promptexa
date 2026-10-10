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
}

const Ctx = createContext<{ def: DemoSiteDef; base: string; store: DemoStore } | null>(null);

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo outside DemositeProvider");
  return v;
}

export function DemositeProvider({ slug, def, children }: { slug: string; def: DemoSiteDef; children: React.ReactNode }) {
  const base = `/demo${slug}`;
  const ident = () => {
    const s = read<string | null>(K(slug, "session"), null);
    return s || "guest";
  };

  const [user, setUser] = useState<DemoUser | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wallet, setWallet] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [orders, setOrders] = useState<DemoOrderRec[]>([]);
  const [bookings, setBookings] = useState<DemoBookingRec[]>([]);

  const loadIdentity = useCallback(() => {
    const id = ident();
    const u = read<DemoUser | null>(K(slug, `user:${id}`), null);
    setUser(id === "guest" ? null : u);
    setCart(read(K(slug, `cart:${id}`), []));
    setWallet(read(K(slug, `wallet:${id}`), 0));
    setTxs(read(K(slug, `txs:${id}`), []));
  }, [slug]);

  useEffect(() => {
    setOrders(read(K(slug, "orders"), []));
    setBookings(read(K(slug, "bookings"), []));
    loadIdentity();
  }, [slug, loadIdentity]);

  const persistCart = (c: CartLine[]) => {
    setCart(c);
    write(K(slug, `cart:${ident()}`), c);
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
        const users = read<Record<string, DemoUser>>(K(slug, "users"), {});
        if (users[phone]) return "এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে — লগইন করুন";
        users[phone] = { name, phone, pass, address: "" };
        write(K(slug, "users"), users);
        write(K(slug, "session"), phone);
        // merge guest cart → new account
        const guestCart = read<CartLine[]>(K(slug, "cart:guest"), []);
        write(K(slug, `cart:${phone}`), guestCart);
        write(K(slug, "cart:guest"), []);
        // signup bonus
        write(K(slug, `wallet:${phone}`), 5000);
        write(K(slug, `txs:${phone}`), [{ date: Date.now(), label: "🎁 সাইনআপ বোনাস", amount: 5000 }]);
        loadIdentity();
        return null;
      },
      login: (phone, pass) => {
        phone = phone.trim();
        const users = read<Record<string, DemoUser>>(K(slug, "users"), {});
        const u = users[phone];
        if (!u) return "এই নম্বরে অ্যাকাউন্ট নেই — সাইন আপ করুন";
        if (u.pass !== pass) return "পাসওয়ার্ড ভুল হয়েছে";
        write(K(slug, "session"), phone);
        const guestCart = read<CartLine[]>(K(slug, "cart:guest"), []);
        if (guestCart.length) {
          const mine = read<CartLine[]>(K(slug, `cart:${phone}`), []);
          const merged = [...mine];
          for (const g of guestCart) {
            const f = merged.find((m) => m.id === g.id);
            if (f) f.qty += g.qty;
            else merged.push(g);
          }
          write(K(slug, `cart:${phone}`), merged);
          write(K(slug, "cart:guest"), []);
        }
        loadIdentity();
        return null;
      },
      logout: () => {
        try {
          localStorage.removeItem(K(slug, "session"));
        } catch {}
        loadIdentity();
      },
      saveAddress: (a) => {
        const id = me();
        if (id === "guest") return;
        const u = read<DemoUser | null>(K(slug, `user:${id}`), null);
        if (u) {
          u.address = a;
          write(K(slug, `user:${id}`), u);
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
        write(K(slug, `wallet:${id}`), w);
        write(K(slug, `txs:${id}`), t);
      },
      payWithWallet: (amount, label) => {
        if (wallet < amount) return false;
        const id = me();
        const w = wallet - amount;
        const t = [{ date: Date.now(), label, amount: -amount }, ...txs].slice(0, 30);
        setWallet(w);
        setTxs(t);
        write(K(slug, `wallet:${id}`), w);
        write(K(slug, `txs:${id}`), t);
        return true;
      },
      orders,
      placeOrder: (o) => {
        const rec: DemoOrderRec = { ...o, id: orderId("DM"), date: Date.now(), status: "প্রসেসিং", userPhone: me() };
        const all = [rec, ...orders].slice(0, 50);
        setOrders(all);
        write(K(slug, "orders"), all);
        persistCart([]);
        return rec;
      },
      bookings,
      placeBooking: (b) => {
        const rec: DemoBookingRec = { ...b, id: orderId("BK"), createdAt: Date.now(), status: "কনফার্মড", userPhone: me() };
        const all = [rec, ...bookings].slice(0, 50);
        setBookings(all);
        write(K(slug, "bookings"), all);
        return rec;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user, cart, wallet, txs, orders, bookings, loadIdentity]);

  return <Ctx.Provider value={{ def, base, store }}>{children}</Ctx.Provider>;
}
