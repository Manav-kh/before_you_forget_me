import type { MetadataRoute } from 'next';
import { getPublicCatalog, getPublicPosts } from '../ui/data';
import { publicUrl } from '../ui/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [editions, posts] = await Promise.all([getPublicCatalog(), getPublicPosts()]);
  const publicPaths = ['/', '/book', '/author', '/shop', '/journal', '/contact', '/invite', '/policies/shipping', '/policies/returns', '/policies/privacy'];
  return [
    ...publicPaths.map(path => ({ url: publicUrl(path) })),
    ...editions.map(edition => ({ url: publicUrl(`/shop/${edition.slug}`), lastModified: edition.updatedAt })),
    ...posts.map(post => ({ url: publicUrl(`/journal/${post.slug}`), lastModified: post.updatedAt })),
  ];
}
