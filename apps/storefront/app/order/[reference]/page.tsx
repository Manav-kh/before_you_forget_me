import type { Metadata } from 'next';
import { OrderView } from '../../../ui/orders';
export const metadata:Metadata={title:'Your private order',robots:{index:false,follow:false,noarchive:true},referrer:'no-referrer'};
export default async function OrderPage({params}:{params:Promise<{reference:string}>}){return <OrderView reference={(await params).reference}/>;}
