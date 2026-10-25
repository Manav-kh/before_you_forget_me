import { pageMetadata, articleStructuredData, JsonLd } from '../../../ui/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicContent, getPublicPost, readableDate } from '../../../ui/data';
import { ArrowLink, Prose } from '../../../ui/blocks';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const [post,content]=await Promise.all([getPublicPost((await params).slug),getPublicContent()]);if(!post)notFound();return pageMetadata({path:`/journal/${post.slug}`,title:post.title,description:post.excerpt,content,imageUrl:post.imageUrl,article:post});}
export default async function PostPage({params}:Props){const [post,content]=await Promise.all([getPublicPost((await params).slug),getPublicContent()]);if(!post)notFound();return <article><JsonLd data={articleStructuredData(content,post)}/><header className="reading-width article-header"><div className="post-meta"><span>{post.category}</span>{post.publishedAt&&<time dateTime={post.publishedAt}>{readableDate(post.publishedAt)}</time>}</div><h1>{post.title}</h1>{post.excerpt&&<p className="article-excerpt">{post.excerpt}</p>}</header>{post.imageUrl&&<img className="article-hero" src={post.imageUrl} alt={post.title} width="1000" height="600" fetchPriority="high"/>}<div className="reading-width article-body reading-section"><Prose text={post.body}/><footer className="article-footer"><ArrowLink href="/journal">Back to the journal</ArrowLink></footer></div></article>;}
