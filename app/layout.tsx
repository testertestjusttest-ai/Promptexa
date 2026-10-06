import './globals.css'
import './store-polish.css'
import Link from 'next/link'

export const metadata={title:'DigiPlyra — Digital Services Store',description:'Legal digital products and services with simple checkout and customer delivery.'}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="bn"><body>
    <header className="nav store-nav">
      <div className="nav-left">
        <Link href="/" className="brand">DigiPlyra</Link>
        <span className="brand-sub">DIGITAL MARKETPLACE</span>
      </div>
      <nav className="navlinks" aria-label="Primary navigation">
        <Link href="/">Store</Link>
        <Link href="/account">Orders</Link>
        <Link href="/checkout">Cart <span className="cart-dot">0</span></Link>
        <Link href="/admin">Admin</Link>
      </nav>
      <div className="navactions">
        <Link href="/account" className="account-pill">Account</Link>
        <Link href="/checkout" className="cart-pill" aria-label="Shopping cart">🛒 <span>Cart</span></Link>
        <details className="mobile-menu">
          <summary aria-label="Open menu">☰</summary>
          <div className="mobile-menu-panel">
            <Link href="/">Store</Link>
            <Link href="/account">Orders</Link>
            <Link href="/checkout">Cart</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </details>
      </div>
    </header>
    {children}
    <footer><div><strong>DigiPlyra</strong><p>© {new Date().getFullYear()} · Legal digital products & services</p></div><div className="footerlinks"><Link href="/">Store</Link><Link href="/account">Orders</Link><Link href="/checkout">Checkout</Link></div></footer>
  </body></html>
}
