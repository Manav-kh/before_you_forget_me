import type { Metadata } from 'next';
import type { Edition, Post, Settings } from '@byfm/contracts';

export function storefrontOrigin(): URL {
  return new URL(process.env.STOREFRONT_ORIGIN || 'http://localhost:3000');
}

export function publicUrl(path: string): string {
  return new URL(path, storefrontOrigin()).toString();
}

export function pageMetadata(input: {
  path: string;
  title: string;
  description: string;
  content: Settings;
  imageUrl?: string;
  article?: Post;
}): Metadata {
  const description = input.description.replace(/\s+/g, ' ').trim().slice(0, 200);
  const title = input.title === input.content.siteName ? `${input.content.siteName} · ${input.content.authorName}` : `${input.title} · ${input.content.siteName}`;
  const image = input.imageUrl || input.content.heroImageUrl;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: publicUrl(input.path) },
    openGraph: {
      type: input.article ? 'article' : 'website',
      title,
      description,
      url: publicUrl(input.path),
      siteName: input.content.siteName,
      locale: 'en_IN',
      ...(image ? { images: [{ url: publicUrl(image), alt: input.article?.title || input.content.siteName }] } : {}),
      ...(input.article ? {
        ...(input.article.publishedAt ? { publishedTime: input.article.publishedAt } : {}),
        modifiedTime: input.article.updatedAt,
        authors: [input.content.authorName],
      } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [publicUrl(image)] } : {}),
    },
  };
}

export function bookStructuredData(content: Settings, edition?: Edition) {
  const path = edition ? `/shop/${edition.slug}` : '/book';
  const image = edition?.imageUrl || content.heroImageUrl;
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': publicUrl(`${path}#book`),
    name: content.siteName,
    description: edition?.description || content.bookDescription,
    author: { '@type': 'Person', name: content.authorName, url: publicUrl('/author') },
    url: publicUrl(path),
    ...(image ? { image: publicUrl(image) } : {}),
    ...(edition ? { bookEdition: edition.name } : {}),
    ...(edition && content.orderEnabled ? {
      offers: {
        '@type': 'Offer',
        url: publicUrl(path),
        price: (edition.pricePaise / 100).toFixed(2),
        priceCurrency: 'INR',
        availability: `https://schema.org/${edition.stock > 0 ? 'InStock' : 'OutOfStock'}`,
      },
    } : {}),
  };
}

export function articleStructuredData(content: Settings, post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    articleBody: post.body,
    articleSection: post.category,
    mainEntityOfPage: publicUrl(`/journal/${post.slug}`),
    author: { '@type': 'Person', name: content.authorName, url: publicUrl('/author') },
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    ...(post.imageUrl ? { image: publicUrl(post.imageUrl) } : {}),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
