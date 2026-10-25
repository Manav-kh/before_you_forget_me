import { pageMetadata } from '../../../ui/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicContent } from '../../../ui/data';
import { PageIntro, Prose } from '../../../ui/blocks';
const policyTitles:Record<string,string>={shipping:'Shipping & delivery',returns:'Returns & cancellations',privacy:'Privacy'};
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;if(!policyTitles[slug])notFound();const content=await getPublicContent();const text=slug==='shipping'?content.shippingPolicy:slug==='returns'?content.returnsPolicy:content.privacyPolicy;return pageMetadata({path:`/policies/${slug}`,title:policyTitles[slug]!,description:text||`${policyTitles[slug]} information for ${content.siteName}.`,content});}
export default async function PolicyPage({params}:Props){const {slug}=await params;if(!policyTitles[slug])notFound();const content=await getPublicContent();const text=slug==='shipping'?content.shippingPolicy:slug==='returns'?content.returnsPolicy:content.privacyPolicy;return <><PageIntro label="Helpful details" title={policyTitles[slug]!}/><section className="reading-width policy-content">{text?<Prose text={text}/>:<p className="notice">These details are being prepared. Please contact us before placing an order if you need more information.</p>}</section></>;}
