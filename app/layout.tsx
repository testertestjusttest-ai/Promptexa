import './globals.css'
import Link from 'next/link'
export const metadata={title:'DigiPlyra — Digital Services Store',description:'Legal digital products and services with simple checkout and customer delivery.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="bn"><body><header className="nav"><Link href="/" className="brand">DigiPlyra</Link><nav><Link href="/">Store</Link><Link href="/account">Account</Link><Link href="/checkout">Checkout</Link><Link href="/admin">Admin</Link></nav></header>{children}<footer>© {new Date().getFullYear()} DigiPlyra · Legal digital products & services</footer></body></html>}
