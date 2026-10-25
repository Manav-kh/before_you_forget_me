import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CircleArrowRight } from 'lucide-react';
import { formatMoney } from '@byfm/contracts';
import { getPublicCatalog, getPublicContent, getPublicPosts, paragraphs } from '../ui/data';
import { pageMetadata } from '../ui/seo';
import { ArrowLink, PostCard, Prose } from '../ui/blocks';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicContent();
  return pageMetadata({ path: '/', title: content.siteName, description: content.tagline || content.bookDescription, content });
}

const sampleNotes = [
  { image: 'review-reading', title: 'A quiet kind of love', text: 'The little moments are the ones that stay with you.' },
  { image: 'review-letters', title: 'Between the lines', text: 'A story to read slowly, and return to in your thoughts.' },
  { image: 'review-window', title: 'Long after the last page', text: 'For anyone who has held on to a memory a little longer.' },
];

export default async function HomePage() {
  const [content, editions, posts] = await Promise.all([getPublicContent(), getPublicCatalog(), getPublicPosts()]);
  const featured = editions.filter(edition => edition.isFeatured).slice(0, 3);
  const firstEdition = featured.find(edition => edition.stock > 0) || editions.find(edition => edition.stock > 0);
  const cover = content.heroImageUrl || '/media/book-cover.webp';
  const portrait = content.authorImageUrl || '/media/author.webp';
  const bookExcerpt = paragraphs(content.bookDescription)[0] || content.bookDescription;
  const authorExcerpt = paragraphs(content.authorBio)[0] || content.authorBio;
  const longAuthorName = content.authorName.length > 20;
  const authorNameStyle = { '--author-name-scale': Math.min(1, 20 / (content.authorName.length + 3)) } as CSSProperties;

  return <div className="reference-home">
    <section className={`moonlit-hero ${longAuthorName ? 'has-long-author' : ''}`} style={authorNameStyle} aria-labelledby="book-title">
      <picture className="moonlit-art">
        <img src="/media/hero-moonlit.webp" width="1536" height="1024" alt="A couple beside a moonlit lake, with a sunflower held behind her back" fetchPriority="high" />
      </picture>
      <div className="hero-shade" aria-hidden="true" />
      <h1 id="book-title" className="hero-book-title">Before you forget me</h1>
      <div className="hero-story-invitation">
        <p>{content.tagline}</p>
        <div className="hero-pill-actions">
          <Link href="/book" className="hero-pill">Explore the book <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <Link href="/shop" className="hero-pill hero-pill-outline">Find your copy <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="hero-author-cutout">
        <h2>{content.authorName}</h2>
        <p>Stories of love, memory, and the moments that stay.</p>
      </div>
      <p className="hero-author-byline">By {content.authorName}</p>
    </section>

    <section className="reference-introduction wide-container" aria-label="Meet the story" data-reveal>
      <Link className="intro-portrait" href="/author" aria-label={`Meet ${content.authorName}`}>
        <img src={portrait} alt={content.authorName} width="261" height="347" />
        <span className="image-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span>
      </Link>
      <div className="intro-statement">
        <h2>Love written<br />between the<br />pages of our<br />lives</h2>
        <Link href="/book" className="outline-pill">Explore the story <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
      <div className="sample-notes" aria-label="Illustrative reader notes">
        {sampleNotes.map(note => <article className="sample-note" key={note.image}>
          <img src={`/media/${note.image}-small.webp`} alt="" width="72" height="72" loading="lazy" />
          <div><span className="sample-label">Sample review</span><h3>{note.title}</h3><p>“{note.text}”</p></div>
        </article>)}
      </div>
    </section>

    <div className="signature-band" aria-label={`${content.authorName}, author`}>
      <div className="signature-track" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => <img src="/media/signature.png" alt="" width="130" height="70" key={index} loading="lazy" />)}
      </div>
    </div>

    <section className="reference-book container" aria-labelledby="novel-heading" data-reveal>
      <div className="book-feature-art">
        <img src={cover} alt="Before You Forget Me, a novel by Harshdeep Thakral" width="900" height="900" loading="lazy" />
        <Link href="/author" className="book-author-tag">The author <ArrowUpRight size={13} aria-hidden="true" /></Link>
      </div>
      <div className="book-feature-copy">
        <p className="gold-label">A novel of love &amp; memory</p>
        <h2 id="novel-heading">Before you<br />forget me</h2>
        <Prose text={bookExcerpt} />
        <Link className="button book-feature-button" href={firstEdition ? `/shop/${firstEdition.slug}` : '/shop'}>
          Find your copy <CircleArrowRight size={20} aria-hidden="true" />
        </Link>
        {content.homeQuote && <blockquote className="book-pullquote">“{content.homeQuote}”</blockquote>}
      </div>
    </section>

    {featured.length > 0 && <section className="featured-edition-section container" aria-labelledby="editions-heading" data-reveal>
      <div className="compact-section-heading"><h2 id="editions-heading">Choose your edition</h2><ArrowLink href="/shop">All editions</ArrowLink></div>
      <div className="featured-edition-row">{featured.map(edition => <Link href={`/shop/${edition.slug}`} className="featured-edition" key={edition.id}>
        <div className="featured-edition-image">{edition.imageUrl ? <img src={edition.imageUrl} alt="" width="90" height="130" loading="lazy" /> : <span>Artwork<br />coming soon</span>}</div>
        <div><span className="edition-format">{edition.format}</span><h3>{edition.name}</h3><p>{formatMoney(edition.pricePaise)} <span>· {edition.stock > 0 ? 'Available' : 'Unavailable'}</span></p></div>
        <ArrowUpRight size={19} aria-hidden="true" />
      </Link>)}</div>
    </section>}

    <section className="reference-author container" aria-labelledby="author-heading" data-reveal>
      <div className="centered-heading"><p>The person behind the pages</p><h2>Meet the author</h2></div>
      <div className="reference-author-grid">
        <div className="reference-author-portrait"><img src={portrait} alt={`${content.authorName}, photographed outdoors`} width="261" height="347" loading="lazy" /></div>
        <div className="reference-author-copy">
          <div className="author-heading-stack"><span aria-hidden="true">{content.authorName}</span><h2 id="author-heading">{content.authorName}</h2></div>
          <Prose text={authorExcerpt} />
          <Link className="button" href="/author">Read full bio <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>

    <section className={`reference-journal container ${posts.length ? '' : 'journal-introduction-only'}`} aria-labelledby="journal-heading" data-reveal>
      <div className="compact-section-heading"><div><p className="quiet-label">From the journal</p><h2 id="journal-heading">In the margins</h2></div><ArrowLink href="/journal">Read the journal</ArrowLink></div>
      {posts.length > 0 ? <div className="post-grid">{posts.slice(0, 3).map(post => <PostCard key={post.id} post={post} />)}</div> : <p>Notes on writing, reading and remembering. New entries will find a home here.</p>}
    </section>

    <section className="reference-reviews container" aria-labelledby="reader-moments-heading" data-reveal>
      <div className="centered-heading"><p>Read. Remember. Return.</p><h2 id="reader-moments-heading">Stories that stay</h2><span className="review-disclosure">Illustrative previews · sample review copy</span></div>
      <div className="reader-moment-grid">{sampleNotes.map((note, index) => <Link className="reader-moment-card" href="/book" key={note.image} aria-label={`${note.title}, illustrative preview. Explore the book.`}>
        <picture><source media="(max-width: 700px)" srcSet={`/media/${note.image}-small.webp`} /><img src={`/media/${note.image}.webp`} alt="" width="768" height="1024" loading="lazy" /></picture>
        <div className="reader-moment-shade" aria-hidden="true" />
        <span className="preview-badge">Sample review</span>
        <div className="reader-moment-copy"><span className="reader-moment-number">0{index + 1} / A READING MOMENT</span><h3>{note.title}</h3><p>“{note.text}”</p><span className="moment-card-link">Explore the book <ArrowUpRight size={20} aria-hidden="true" /></span></div>
      </Link>)}</div>
      <p className="review-footnote">These artworks and sample notes illustrate the reading experience. They are not submitted customer reviews.</p>
    </section>
  </div>;
}
