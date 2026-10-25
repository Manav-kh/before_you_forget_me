import 'server-only';
export { getPublicCatalog, getPublicEdition, getPublicContent, getPublicPosts, getPublicPost } from '@byfm/domain';

export function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(line => line.trim()).filter(Boolean);
}

export function readableDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(value));
}
