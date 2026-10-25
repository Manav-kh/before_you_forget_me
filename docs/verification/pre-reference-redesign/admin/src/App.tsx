import { useCallback, useEffect, useState, type ComponentType, type FormEvent } from 'react';
import { LayoutDashboard, BookOpen, ShoppingBag, Users, NotebookPen, MessageSquare, Image, Settings as SettingsIcon, History, Menu, X, ArrowUpRight, LogOut, Check, LoaderCircle } from 'lucide-react';
import type { AdminSession } from '@byfm/contracts';
import { request, errorMessage } from './api';
import { StudioContext, makeMutation } from './context';
import { ErrorBox, Loading } from './ui';
import { Dashboard, Orders, Customers, Enquiries } from './Operations';
import { Editions, Journal } from './Content';
import { MediaLibrary, Settings, Activity } from './Library';

const sections = [
  { id: 'overview', title: 'Overview', icon: LayoutDashboard, component: Dashboard },
  { id: 'editions', title: 'Editions', icon: BookOpen, component: Editions },
  { id: 'orders', title: 'Orders', icon: ShoppingBag, component: Orders },
  { id: 'customers', title: 'Customers', icon: Users, component: Customers },
  { id: 'journal', title: 'Journal', icon: NotebookPen, component: Journal },
  { id: 'enquiries', title: 'Enquiries', icon: MessageSquare, component: Enquiries },
  { id: 'media', title: 'Media library', icon: Image, component: MediaLibrary },
  { id: 'settings', title: 'Settings', icon: SettingsIcon, component: Settings },
  { id: 'activity', title: 'Activity log', icon: History, component: Activity },
] as const;
const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || 'http://127.0.0.1:3000';
const readSection = () => sections.some(section => section.id === location.hash.slice(1).split('?')[0]) ? location.hash.slice(1).split('?')[0] : 'overview';

export function App() {
  const [session, setSession] = useState<AdminSession | null>(null); const [checking, setChecking] = useState(true); const [sessionError, setSessionError] = useState('');
  const [active, setActive] = useState(readSection); const [navOpen, setNavOpen] = useState(false); const [toast, setToast] = useState(''); const [logoutBusy, setLogoutBusy] = useState(false);
  const checkSession = useCallback(() => { setChecking(true); setSessionError(''); request<AdminSession>('session').then(setSession).catch(error => { if (error.status !== 401) setSessionError(errorMessage(error)); }).finally(() => setChecking(false)); }, []);
  useEffect(() => { checkSession(); }, [checkSession]);
  useEffect(() => { const expired = () => { setSession(null); setSessionError('Your session expired. Sign in to continue.'); }; window.addEventListener('studio-session-expired', expired); return () => window.removeEventListener('studio-session-expired', expired); }, []);
  useEffect(() => { const onHash = () => { setActive(readSection()); setNavOpen(false); window.scrollTo({ top: 0 }); }; window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []);
  useEffect(() => { document.title = `${sections.find(section => section.id === active)?.title ?? 'Studio'} — Before You Forget Me`; }, [active]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 4500); return () => window.clearTimeout(timer); }, [toast]);
  if (checking) return <div className="session-screen"><Loading/></div>;
  if (!session) return <Login onSuccess={setSession} initialError={sessionError} />;
  const CurrentPage = (sections.find(section => section.id === active)?.component ?? Dashboard) as ComponentType;
  const logout = async () => { setLogoutBusy(true); try { await request('logout', { method: 'POST', csrf: session.csrfToken }); setSession(null); } catch (error) { setToast(errorMessage(error)); } finally { setLogoutBusy(false); } };
  return <StudioContext.Provider value={{ session, notify: setToast, mutate: makeMutation(session.csrfToken) }}><div className="studio-shell"><a href="#main" className="skip-link" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a><header className="mobile-header"><a href="#overview" className="mobile-brand">The author’s studio</a><button type="button" className="icon-button" aria-label={navOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={navOpen} aria-controls="studio-navigation" onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X/> : <Menu/>}</button></header>{navOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)}/>}<aside id="studio-navigation" className={`sidebar ${navOpen ? 'open' : ''}`}><a className="studio-brand" href="#overview"><span className="brand-rule"/><span>before you<br/><em>forget me.</em></span><small>THE AUTHOR’S STUDIO</small></a><nav aria-label="Studio navigation">{sections.map(({ id, title, icon: Icon }, index) => <a key={id} href={`#${id}`} className={`${active === id ? 'selected' : ''} ${index === 6 ? 'nav-break' : ''}`} aria-current={active === id ? 'page' : undefined}><Icon size={18} strokeWidth={1.6}/><span>{title}</span>{id === 'overview' && <span className="nav-dot"/>}</a>)}</nav><div className="sidebar-bottom"><a href={storefrontUrl} target="_blank" rel="noreferrer">View storefront<ArrowUpRight size={16}/></a><div className="account"><span className="avatar">{session.user.name.charAt(0).toUpperCase()}</span><div><strong>{session.user.name}</strong><span>{session.user.email}</span></div><button type="button" className="icon-button" aria-label="Sign out" title="Sign out" disabled={logoutBusy} onClick={logout}>{logoutBusy ? <LoaderCircle className="spin" size={17}/> : <LogOut size={17}/>}</button></div></div></aside><main id="main" tabIndex={-1}><div className="topbar"><span>Workspace <span className="divider">/</span> {sections.find(section => section.id === active)?.title}</span><span className="workspace-label"><span/>Private studio</span></div><div className="page-content" key={active}><CurrentPage/></div><footer className="studio-footer"><span>Before You Forget Me</span><span>A little care, in every detail.</span></footer></main>{toast && <div className="toast" role="status"><Check size={17}/><span>{toast}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15}/></button></div>}</div></StudioContext.Provider>;
}

function Login({ onSuccess, initialError }: { onSuccess: (session: AdminSession) => void; initialError: string }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(initialError); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (busy) return; setBusy(true); setError(''); try { onSuccess(await request<AdminSession>('login', { method: 'POST', body: { email, password } })); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); } }
  return <div className="login-layout"><div className="login-story"><a href={storefrontUrl} className="login-wordmark">before you<br/><em>forget me.</em></a><div><p className="eyebrow">THE AUTHOR’S STUDIO</p><h1>Good stories deserve<br/><em>a thoughtful home.</em></h1><p>A quiet space to look after your books, your readers, and everything in between.</p></div><small>Words that stay. Details that matter.</small></div><main className="login-form-wrap"><form className="login-form" onSubmit={submit}><p className="eyebrow">WELCOME BACK</p><h2>Come on in.</h2><p>Sign in to manage your author’s studio.</p>{error && <ErrorBox message={error}/>}<label className="field"><span>Email address</span><input type="email" name="email" autoComplete="username" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)}/></label><label className="field"><span>Password</span><input type="password" name="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)}/></label><button className="button" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16}/>Signing in…</> : <>Enter the studio<ArrowUpRight size={16}/></>}</button><p className="login-help">Use the private administrator credentials from your local setup.</p></form></main></div>;
}
