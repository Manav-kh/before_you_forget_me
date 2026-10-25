import { pageMetadata } from '../../ui/seo';
import type { Metadata } from 'next';
import { getPublicContent } from '../../ui/data';
import { PageIntro } from '../../ui/blocks';
import { EnquiryForm } from '../../ui/forms';
export async function generateMetadata():Promise<Metadata>{const content=await getPublicContent();return pageMetadata({path:'/contact',title:'Get in touch',description:`Contact ${content.authorName} about the book, an order or a conversation.`,content});}
export default async function ContactPage(){const content=await getPublicContent();return <><PageIntro label="A conversation starts here" title={<>A note, a thought,<br/>a hello.</>} description="Questions about the book, an order, or something the story brought to mind? There is room for it here."/><section className="container form-layout"><aside className="form-aside"><h2>Let’s keep<br/><em>in touch.</em></h2><p>Use the form to send a message to the author’s team.</p>{content.contactEmail&&<p><a href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a></p>}<p>Planning a reading, conversation, or event? <a href="/invite">Send an invitation</a>.</p></aside><EnquiryForm kind="contact"/></section></>;}
