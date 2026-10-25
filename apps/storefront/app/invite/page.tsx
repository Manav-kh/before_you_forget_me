import { getPublicContent } from '../../ui/data';
import { pageMetadata } from '../../ui/seo';
import type { Metadata } from 'next';
import { PageIntro } from '../../ui/blocks';
import { EnquiryForm } from '../../ui/forms';
export async function generateMetadata():Promise<Metadata>{const content=await getPublicContent();return pageMetadata({path:'/invite',title:'Invite the author',description:`Invite ${content.authorName} to a reading, book club or literary conversation.`,content});}
export default function InvitePage(){return <><PageIntro label="Beyond the page" title={<>Bring the story<br/>into the room.</>} description="For readings, book clubs, literary conversations and invitations to connect with Harshdeep Thakral."/><section className="container form-layout"><aside className="form-aside"><h2>A shared<br/><em>conversation.</em></h2><p>Tell us what you are planning and how the author might be part of it.</p><p>A date, venue or online format, and a little about your audience will help us understand the invitation.</p><p>Submitting an invitation does not confirm attendance. The details can be discussed together.</p></aside><EnquiryForm kind="invitation"/></section></>;}
