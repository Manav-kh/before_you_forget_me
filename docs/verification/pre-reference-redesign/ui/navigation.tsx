'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BagLink } from './cart';

export function Navigation({authorName}:{authorName:string}) {
  const path=usePathname(); const [open,setOpen]=useState(false);
  const links=[['The book','/book'],['The author','/author'],['Journal','/journal'],['Shop','/shop']];
  return <header className="site-header"><div className="container header-inner"><Link className="wordmark" href="/" onClick={()=>setOpen(false)} aria-label={`${authorName}, home`}><img src="/media/signature.png" alt={authorName} width="163" height="52"/><span className="wordmark-caption">AUTHOR &amp; STORYTELLER</span></Link><nav className="desktop-nav" aria-label="Main navigation">{links.map(([label,href])=><Link key={href} href={href!} aria-current={path.startsWith(href!)?'page':undefined}>{label}</Link>)}</nav><div className="header-actions"><BagLink/><button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></div>{open&&<nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{[...links,['Contact','/contact'],['Your orders','/orders']].map(([label,href])=><Link key={href} href={href!} onClick={()=>setOpen(false)} aria-current={path.startsWith(href!)?'page':undefined}>{label}</Link>)}</nav>}</header>;
}
