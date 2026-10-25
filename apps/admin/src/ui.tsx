import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search, X, LoaderCircle, ArrowUpRight, RotateCw, CircleAlert, Clock3, CheckCircle2, CircleX, PackageOpen, PackageCheck, Truck, CircleDashed, Mail, MessageCircle, CheckCheck, FilePenLine, Eye, UserRoundCheck, UserRoundX, Archive, CreditCard, Star, CalendarDays, type LucideIcon } from 'lucide-react';
import type { ZodType } from 'zod';

export const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(paise / 100);
export const date = (value: string | null | undefined) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
export const label = (value: string) => value.replace(/_/g, ' ').replace(/^./, char => char.toUpperCase());
export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function safeImage(value: string) { return /^\/(?!\/)/.test(value) || /^https:\/\//.test(value) ? value : ''; }

export function Badge({ children, tone = 'neutral', icon: Icon }: { children: ReactNode; tone?: string; icon?: LucideIcon }) { return <span className={`badge ${tone}`}>{Icon && <Icon size={13} strokeWidth={1.8} aria-hidden="true"/>}<span>{children}</span></span>; }
const statuses: Record<string, { tone: string; icon: LucideIcon; text?: string }> = {
  pending_confirmation: { tone: 'amber', icon: Clock3, text: 'Awaiting confirmation' },
  confirmed: { tone: 'green', icon: CheckCircle2 },
  cancelled: { tone: 'red', icon: CircleX },
  unfulfilled: { tone: 'neutral', icon: PackageOpen },
  processing: { tone: 'blue', icon: CircleDashed },
  shipped: { tone: 'blue', icon: Truck },
  delivered: { tone: 'green', icon: PackageCheck },
  unpaid: { tone: 'payment', icon: CreditCard },
  new: { tone: 'amber', icon: Mail },
  in_progress: { tone: 'blue', icon: MessageCircle },
  resolved: { tone: 'green', icon: CheckCheck },
  draft: { tone: 'neutral', icon: FilePenLine },
  published: { tone: 'green', icon: Eye },
  live: { tone: 'green', icon: Eye, text: 'Published' },
  archived: { tone: 'neutral', icon: Archive },
  inactive: { tone: 'neutral', icon: UserRoundX },
  active: { tone: 'green', icon: UserRoundCheck },
  featured: { tone: 'gold', icon: Star },
  contact: { tone: 'neutral', icon: Mail },
  invitation: { tone: 'blue', icon: CalendarDays },
};
export function Status({ value }: { value: string }) { const status = statuses[value] ?? { tone: 'neutral', icon: CircleDashed }; return <Badge tone={status.tone} icon={status.icon}>{status.text ?? label(value)}</Badge>; }
export function ColumnLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) { return <span className="column-label"><Icon size={13} strokeWidth={1.7} aria-hidden="true"/>{children}</span>; }
export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) { return <div className="error-box" role="alert"><CircleAlert size={19} aria-hidden="true"/><span>{message}</span>{retry && <button type="button" className="button small secondary" onClick={retry}><RotateCw size={14} aria-hidden="true"/>Try again</button>}</div>; }
export function Loading() { return <div className="loading" role="status"><LoaderCircle className="spin" size={20}/><span>Loading studio records…</span></div>; }
export function Empty({ title = 'Nothing here yet', children }: { title?: string; children?: ReactNode }) { return <div className="empty"><span className="empty-rule"/><h3>{title}</h3><p>{children ?? 'Records will appear here when they are created.'}</p></div>; }
export function PageTitle({ eyebrow, title, description, children, icon: Icon }: { eyebrow: string; title: string; description: string; children?: ReactNode; icon?: LucideIcon }) { return <header className="page-title"><div><p className="eyebrow">{Icon && <Icon size={15} strokeWidth={1.8} aria-hidden="true"/>}{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{children && <div className="page-actions">{children}</div>}</header>; }
export function Export({ kind }: { kind: 'orders' | 'customers' | 'enquiries' }) { return <a className="button secondary" href={`/api/admin/export/${kind}`} download><ArrowUpRight size={16}/>Export CSV</a>; }
export function SearchField({ value, onChange, placeholder = 'Search records…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="search-field"><Search size={17}/><span className="sr-only">{placeholder}</span><input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder}/></label>; }
export function usePagination<T>(items: T[], reset: string, pageSize = 10) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [reset]);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pages);
  return { items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize), pagination: <div className="pagination"><span>{items.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, items.length)} of ${items.length}` : '0 records'}</span><div><button className="icon-button" type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17}/></button><span>Page {currentPage} of {pages}</span><button className="icon-button" type="button" aria-label="Next page" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={17}/></button></div></div> };
}

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const titleId = useId(); const panel = useRef<HTMLDivElement>(null); const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]') ?? []).filter(element => !element.hidden && element.getClientRects().length > 0);
    (focusable()[0] ?? panel.current)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') { const elements = focusable(); const first = elements[0]; const last = elements[elements.length - 1]; if (!first) { event.preventDefault(); return; } if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={panel}><div className="modal-heading"><div><p className="eyebrow">Studio record</p><h2 id={titleId}>{title}</h2></div><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{children}</div></div>;
}

export function Field({ label: fieldLabel, hint, error, children, className = '' }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) { return <label className={`field ${className}`}><span>{fieldLabel}</span>{children}{hint && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>; }
export function Check({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) { return <label className="check"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)}/><span>{children}</span></label>; }
export function FormFooter({ busy, onCancel, text = 'Save changes' }: { busy: boolean; onCancel: () => void; text?: string }) { return <footer className="form-footer"><button className="button secondary" type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="button" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16}/>Saving…</> : text}</button></footer>; }
export function validate<T>(schema: ZodType<T>, value: unknown): { value?: T; errors: Record<string,string> } { const result = schema.safeParse(value); if (result.success) return { value: result.data, errors: {} }; return { errors: Object.fromEntries(result.error.issues.map(issue => [String(issue.path[0]), issue.message])) }; }
export function onForm(submit: () => void) { return (event: FormEvent) => { event.preventDefault(); submit(); }; }
