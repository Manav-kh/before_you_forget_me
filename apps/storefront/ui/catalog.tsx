'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatMoney, type Edition } from '@byfm/contracts';

export function Catalog({editions}:{editions:Edition[]}){
  const [sort,setSort]=useState('featured');
  const sorted=useMemo(()=>[...editions].sort((a,b)=>sort==='price-low'?a.pricePaise-b.pricePaise:sort==='price-high'?b.pricePaise-a.pricePaise:sort==='name'?a.name.localeCompare(b.name):a.sortOrder-b.sortOrder),[editions,sort]);
  return <><div className="shop-tools"><span>{editions.length} {editions.length===1?'edition':'editions'} to explore</span><label><span className="visually-hidden">Sort editions</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="featured">Edition order</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select></label></div><div className="edition-grid">{sorted.map(edition=><article className="edition-card" key={edition.id}><Link className="edition-art" href={`/shop/${edition.slug}`} tabIndex={-1} aria-hidden="true">{edition.imageUrl?<img src={edition.imageUrl} alt="" width="280" height="410" loading="lazy"/>:<span className="media-unavailable">Edition artwork coming soon</span>}</Link><div className="edition-meta"><span>{edition.format}</span><span>{edition.stock>0?'Available':'Unavailable'}</span></div><Link className="edition-title" href={`/shop/${edition.slug}`}><h3>{edition.name}</h3><ArrowUpRight size={20}/></Link>{edition.summary&&<p>{edition.summary}</p>}<p className="edition-price">{formatMoney(edition.pricePaise)}</p></article>)}</div></>;
}
