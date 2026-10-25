import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CartProvider } from '../ui/cart';
import { Navigation } from '../ui/navigation';
import { MotionEnhancement } from '../ui/motion';
import { getPublicContent } from '../ui/data';
import { storefrontOrigin } from '../ui/seo';
import './globals.css';
import './reference.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  metadataBase: storefrontOrigin(),
  title: { default: 'Before You Forget Me · Harshdeep Thakral', template: '%s · Before You Forget Me' },
  description: 'Before You Forget Me, a novel by Harshdeep Thakral. Explore the story, meet the author and find your edition.',
  referrer: 'strict-origin-when-cross-origin',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getPublicContent();
  return <html lang="en"><head><link rel="preload" href="/fonts/anton-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>
    <CartProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navigation authorName={content.authorName} />
      <main id="main">{children}</main>
      <footer className="reference-footer">
        <div className="container reference-footer-grid">
          <div className="footer-contact"><h2>Let’s talk.</h2><p>For a note, a question,<br />or a conversation beyond the page.</p>{content.contactEmail ? <a href={`mailto:${content.contactEmail}`} className="footer-contact-link">{content.contactEmail} <ArrowUpRight size={18} aria-hidden="true" /></a> : <Link href="/contact" className="footer-contact-link">Get in touch <ArrowUpRight size={18} aria-hidden="true" /></Link>}</div>
          <div className="footer-menu"><h3>Quick links</h3><Link href="/policies/privacy">Privacy information</Link><Link href="/policies/returns">Returns &amp; cancellations</Link><Link href="/policies/shipping">Shipping &amp; delivery</Link><Link href="/orders">Your orders</Link></div>
          <div className="footer-menu"><h3>Reader first</h3><Link href="/author">My story</Link><Link href="/book">What’s this book about?</Link><Link href="/shop">Find your copy</Link><Link href="/journal">The journal</Link><Link href="/invite">Invite the author</Link>{content.instagramUrl && <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}</div>
          <Link href="/" className="footer-signature" aria-label={`${content.authorName}, home`}><img src="/media/signature.png" alt={content.authorName} width="320" height="180" loading="lazy" /></Link>
        </div>
        <div className="container reference-footer-bottom"><span>© {new Date().getFullYear()} {content.authorName}</span><span>Love. Memory. The moments that stay.</span><Link href="/contact">Keep in touch <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
      </footer>
      <MotionEnhancement />
    </CartProvider>
  </body></html>;
}
