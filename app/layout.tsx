import './globals.css'
import './store-polish.css'
import './marketplace-extra.css'
import './payment-admin.css'
import './ad-system.css'
import Link from 'next/link'
import CartCount from './components/cart-count'
import AdSlot from './components/ad-slot'

export const metadata={title:'DigiPlyra — Digital Marketplace',description:'A modern Bangladesh-first marketplace for legal digital products and services.'}

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="bn"><body>
  <div className="topline">Secure digital marketplace <span>·</span> bKash · Nagad · Rocket <span>·</span> Instant delivery after approval</div>
  <header className="nav store-nav">
   <div className="nav-left"><Link href="/" className="brand">DigiPlyra</Link><span className="brand-sub">DIGITAL MARKETPLACE</span></div>
   <nav className="navlinks"><Link href="/">Store</Link><Link href="/cart">Cart <CartCount/></Link><Link href="/account">Account</Link></nav>
   <div className="navactions"><Link href="/account" className="account-pill">Account</Link><Link href="/cart" className="cart-pill" aria-label="Shopping cart">🛒 <span>Cart</span><CartCount/></Link><details className="mobile-menu"><summary aria-label="Open menu">☰</summary><div className="mobile-menu-panel"><Link href="/">Store</Link><Link href="/cart">Cart <CartCount/></Link><Link href="/account">Account / Orders</Link></div></details></div>
  </header>
  {children}
  <AdSlot slot="footer" />
  <footer><div><strong>DigiPlyra</strong><p>© {new Date().getFullYear()} · Legal digital products & services</p></div><div className="footerlinks"><Link href="/">Store</Link><Link href="/cart">Cart</Link><Link href="/account">Account</Link><Link href="/checkout">Checkout</Link></div></footer>
 </body></html>
}
