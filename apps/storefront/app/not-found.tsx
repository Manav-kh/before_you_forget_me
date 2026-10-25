import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export default function NotFound(){return <div className="container not-found"><p className="eyebrow">Page not found</p><h1>A page<br/><em>out of place.</em></h1><p>The page may have moved, or this edition or entry is no longer published.</p><Link className="button" href="/">Back to the beginning <ArrowRight size={18}/></Link></div>;}
