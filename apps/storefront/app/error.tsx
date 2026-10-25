'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="container not-found"><p className="eyebrow">A brief interruption</p><h1>Let’s try<br/><em>that page again.</em></h1><p>We could not load the latest details. Please try again in a moment.</p><div className="inline-actions" style={{justifyContent:'center'}}><button className="button" type="button" onClick={reset}>Try again</button><Link className="button button-secondary" href="/">Return home</Link></div></div>;}
