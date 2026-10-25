import { pageMetadata } from '../../ui/seo';
import type { Metadata } from 'next';
import { getPublicContent, getPublicPosts } from '../../ui/data';
import { EmptyState, PageIntro } from '../../ui/blocks';
import { JournalList } from '../../ui/journal';
export async function generateMetadata():Promise<Metadata>{const content=await getPublicContent();return pageMetadata({path:'/journal',title:'The journal',description:`Notes on writing, reading and remembering, from ${content.authorName}.`,content});}
export default async function JournalPage(){const posts=await getPublicPosts();return <><PageIntro label="The journal" title="In the margins." description="Thoughts on writing, reading, remembering, and the everyday details that become stories."/><section className="container journal-content">{posts.length?<JournalList posts={posts}/>:<EmptyState title="A quiet page, for now.">New writing will appear here when it is ready.</EmptyState>}</section></>;}
