import type { Metadata } from 'next';
import { PageIntro } from '../../ui/blocks';
import { OrderLookup } from '../../ui/orders';
export const metadata:Metadata={title:'Find your order',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function OrdersPage(){return <><PageIntro label="Your orders" title="Return to your story." description="Use your private confirmation link to see your order. You can also enter the order reference and access key here."/><section className="container"><div className="lookup-shell"><OrderLookup/></div></section></>;}
