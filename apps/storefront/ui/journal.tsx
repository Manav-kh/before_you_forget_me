'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Post } from '@byfm/contracts';

export function JournalList({posts}:{posts:Post[]}){
  const [category,setCategory]=useState('All'); const [search,setSearch]=useState('');
  const categories=['All',...new Set(posts.map(post=>post.category))];
  const filtered=useMemo(()=>posts.filter(post=>(category==='All'||post.category===category)&&`${post.title} ${post.excerpt}`.toLowerCase().includes(search.toLowerCase())),[posts,category,search]);
  return <><div className="field search-field"><label htmlFor="journal-search">Find an entry</label><input id="journal-search" type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search the journal"/></div>{categories.length>2&&<div className="journal-filters" aria-label="Journal categories">{categories.map(value=><button type="button" className="filter-button" key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value}</button>)}</div>}<p className="visually-hidden" role="status">{filtered.length} entries found</p>{filtered.length?<div className="post-grid">{filtered.map(post=><article className={`post-card ${post.imageUrl?'':'post-card-text'}`} key={post.id}>{post.imageUrl&&<Link className="post-art" href={`/journal/${post.slug}`} tabIndex={-1} aria-hidden="true"><img src={post.imageUrl} alt="" width="640" height="440" loading="lazy"/></Link>}<div className="post-meta"><span>{post.category}</span>{post.publishedAt&&<time dateTime={post.publishedAt}>{new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date(post.publishedAt))}</time>}</div><h3><Link href={`/journal/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className="text-link" href={`/journal/${post.slug}`}>Read the entry <ArrowRight size={18}/></Link></article>)}</div>:<div className="empty-state"><h2>No entries found.</h2><p>Try another search or category.</p></div>}</>;
}
