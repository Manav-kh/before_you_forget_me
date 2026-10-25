import type { Metadata } from 'next';
import { getPublicCatalog, getPublicContent } from '../../ui/data';
import { PageIntro } from '../../ui/blocks';
import { Checkout } from '../../ui/checkout';
export const metadata:Metadata={title:'Your book bag',robots:{index:false,follow:false}};
export default async function CheckoutPage(){const [editions,content]=await Promise.all([getPublicCatalog(),getPublicContent()]);return <><PageIntro label="One step closer" title="A story, on its way." description="Check your editions and leave your delivery details. No account is needed, and no payment is collected today."/><Checkout editions={editions} enabled={content.orderEnabled} shippingNote={content.shippingNote}/></>;}
