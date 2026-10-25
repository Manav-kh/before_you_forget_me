'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Menu, ReceiptText, Search, X } from 'lucide-react';
import { BagLink } from './cart';

type SearchResult = { title: string; href: string; kind: string };

export function Navigation({ authorName }: { authorName: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const home = path === '/';
  const links = [['Home', '/'], ['Shop', '/shop'], ['About the author', '/author'], ['About the book', '/book'], ['Contact', '/contact']];

  useEffect(() => { setOpen(false); setSearchOpen(false); }, [path]);
  useEffect(() => {
    if (!searchOpen) return;
    const controller = new AbortController();
    searchInput.current?.focus();
    setLoading(true); setError('');
    Promise.all(['/api/catalog', '/api/posts'].map(async url => {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Search is unavailable just now. Please try again.');
      return (await response.json()).data;
    })).then(([editions, posts]) => {
      setResults([
        ...editions.map((edition: { name: string; slug: string }) => ({ title: edition.name, href: `/shop/${edition.slug}`, kind: 'Edition' })),
        ...posts.map((post: { title: string; slug: string }) => ({ title: post.title, href: `/journal/${post.slug}`, kind: 'Journal' })),
      ]);
    }).catch(caught => { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : 'Search is unavailable.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [searchOpen]);
  const filtered = results.filter(result => result.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6);
  const closeSearch = () => { setSearchOpen(false); searchButton.current?.focus(); };

  return <header className={`site-header ${home ? 'is-home' : ''}`}>
    <div className="header-inner">
      <Link className="wordmark" href="/" aria-label={`${authorName}, home`}><img src="/media/signature.png" alt={authorName} width="130" height="70" /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <Link key={href} href={href!} aria-current={href === '/' ? path === '/' ? 'page' : undefined : path.startsWith(href!) ? 'page' : undefined}>{label}</Link>)}</nav>
      <div className="header-actions">
        <button className="quick-icon" type="button" aria-label="Search editions and journal" ref={searchButton} aria-expanded={searchOpen} aria-controls="site-search" onClick={() => { setSearchOpen(!searchOpen); setOpen(false); }}>{searchOpen ? <X size={20} /> : <Search size={20} />}</button>
        <Link className="quick-icon quick-shop" href="/shop" aria-label="Browse book editions"><BookOpen size={20} /></Link>
        <Link className="quick-icon" href="/orders" aria-label="Find your order"><ReceiptText size={20} /></Link>
        <BagLink />
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => { setOpen(!open); setSearchOpen(false); }}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </div>
    {open && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{[...links, ['Journal', '/journal'], ['Your orders', '/orders']].map(([label, href]) => <Link key={href} href={href!} onClick={() => setOpen(false)} aria-current={path === href ? 'page' : undefined}>{label}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</nav>}
    {searchOpen && <div className="site-search" id="site-search" role="region" aria-label="Search the bookshop and journal" onKeyDown={event => { if (event.key === 'Escape') closeSearch(); }}>
      <div className="search-panel-heading"><label htmlFor="site-search-input">Find your next page</label><button className="quick-icon" type="button" onClick={closeSearch} aria-label="Close search"><X size={18} /></button></div>
      <input id="site-search-input" type="search" placeholder="Search editions and journal entries" value={query} onChange={event => setQuery(event.target.value)} ref={searchInput} autoComplete="off" />
      <div className="site-search-results" aria-live="polite">{loading ? <p>Looking through the shelves…</p> : error ? <p role="alert">{error}</p> : filtered.length ? filtered.map(result => <Link key={result.href} href={result.href} onClick={() => setSearchOpen(false)}><span><small>{result.kind}</small>{result.title}</span><ArrowUpRight size={18} aria-hidden="true" /></Link>) : <p>No matching editions or journal entries. Try another word.</p>}</div>
    </div>}
  </header>;
}
