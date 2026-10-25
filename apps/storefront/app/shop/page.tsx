import { pageMetadata } from '../../ui/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { getPublicCatalog, getPublicContent } from '../../ui/data';
import { EmptyState, PageIntro } from '../../ui/blocks';
import { Catalog } from '../../ui/catalog';
export async function generateMetadata():Promise<Metadata>{const content=await getPublicContent();return pageMetadata({path:'/shop',title:'Shop editions',description:`Choose your edition of ${content.siteName} by ${content.authorName}.`,content});}
export default async function ShopPage(){const [editions,content]=await Promise.all([getPublicCatalog(),getPublicContent()]);return <><PageIntro label="The book, in your hands" title="A copy to call yours." description="Explore the available editions of Before You Forget Me. Choose the one you would like to bring home."/><section className="container shop-content"><div className="shop-note"><Package size={19} aria-hidden="true"/><p>{content.shippingNote||'Delivery details and any delivery charges will be confirmed with you personally.'} Orders are requests for confirmation; no online payment is collected.</p></div>{!content.orderEnabled&&<p className="notice">Direct orders are currently paused. You can still browse editions and <Link href="/contact">contact us</Link> about a copy.</p>}{editions.length?<Catalog editions={editions}/>:<EmptyState title="New editions are on their way.">There are no published editions at the moment. <Link href="/contact">Get in touch</Link> for availability.</EmptyState>}</section></>;}
