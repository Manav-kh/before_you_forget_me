import type { Metadata } from 'next';
import Link from 'next/link';
import { CartProvider } from '../ui/cart';
import { Navigation } from '../ui/navigation';
import { getPublicContent } from '../ui/data';
import { storefrontOrigin } from '../ui/seo';
import './globals.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={metadataBase:storefrontOrigin(),title:{default:'Before You Forget Me · Harshdeep Thakral',template:'%s · Before You Forget Me'},description:'Before You Forget Me, a novel by Harshdeep Thakral. Explore the story, meet the author and find your edition.',referrer:'strict-origin-when-cross-origin'};

export default async function RootLayout({children}:{children:React.ReactNode}) {
  const content=await getPublicContent();
  return <html lang="en"><body><CartProvider><a className="skip-link" href="#main">Skip to content</a><Navigation authorName={content.authorName}/><main id="main">{children}</main><footer className="site-footer"><div className="container footer-grid"><div><Link className="footer-title" href="/">Before You<br/><em>Forget Me</em></Link><p>A novel by {content.authorName}</p></div><div className="footer-links"><Link href="/book">The book</Link><Link href="/author">The author</Link><Link href="/journal">Journal</Link><Link href="/shop">Shop editions</Link></div><div className="footer-links"><Link href="/contact">Get in touch</Link><Link href="/invite">Invite the author</Link><Link href="/orders">Your orders</Link>{content.instagramUrl&&<a href={content.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}</div><div className="footer-note"><span>Keep the story close.</span><p>For conversations, readings,<br/>and the moments in between.</p></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {content.authorName}</span><div><Link href="/policies/shipping">Shipping</Link><Link href="/policies/returns">Returns</Link><Link href="/policies/privacy">Privacy</Link></div></div></footer></CartProvider></body></html>;
}
