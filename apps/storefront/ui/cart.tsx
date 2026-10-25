'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ShoppingBag, Plus, Minus, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import type { Edition } from '@byfm/contracts';

export type CartItem = { editionId: string; quantity: number };
const cartKey = 'byfm-cart-v1';
type CartContextValue = { items: CartItem[]; ready: boolean; add: (id:string, quantity:number)=>void; setQuantity:(id:string, quantity:number)=>void; clear:()=>void; storageError:string };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: {children: ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    try {
      const saved:unknown = JSON.parse(localStorage.getItem(cartKey) || '[]');
      if (Array.isArray(saved)) setItems(saved.filter((item):item is CartItem => !!item && typeof item.editionId === 'string' && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10).slice(0,10));
    } catch { setStorageError('Your browser could not restore the bag. You can still choose an edition below.'); }
    setReady(true);
  }, []);
  useEffect(() => { if(ready) { try { localStorage.setItem(cartKey, JSON.stringify(items)); } catch { setStorageError('Your browser is not saving the bag. Keep this page open until you finish.'); } } },[items,ready]);
  const add = useCallback((id:string,quantity:number) => setItems(previous => {
    const found = previous.find(item=>item.editionId===id);
    return found ? previous.map(item=>item.editionId===id ? {...item,quantity:Math.min(10,item.quantity+quantity)}:item) : [...previous,{editionId:id,quantity:Math.min(10,quantity)}].slice(0,10);
  }),[]);
  const setQuantity = useCallback((id:string,quantity:number) => setItems(previous => quantity <= 0 ? previous.filter(item=>item.editionId!==id) : previous.map(item=>item.editionId===id?{...item,quantity:Math.min(10,quantity)}:item)),[]);
  return <CartContext.Provider value={{items,ready,add,setQuantity,clear:()=>setItems([]),storageError}}>{children}</CartContext.Provider>;
}

export function useCart() { const cart=useContext(CartContext); if(!cart) throw new Error('Cart context is unavailable'); return cart; }

export function BagLink() {
  const {items}=useCart(); const count=items.reduce((sum,item)=>sum+item.quantity,0);
  return <Link className="bag-link" href="/checkout" aria-label={`Book bag, ${count} ${count===1?'item':'items'}`}><ShoppingBag size={18} aria-hidden="true"/><span>Bag</span>{count>0&&<span className="bag-count">{count}</span>}</Link>;
}

export function Quantity({value,max=10,onChange,label='Quantity',disabled=false}:{value:number;max?:number;onChange:(value:number)=>void;label?:string;disabled?:boolean}) {
  return <div className="quantity"><button type="button" onClick={()=>onChange(value-1)} disabled={disabled||value<=1} aria-label={`Decrease ${label.toLowerCase()}`}><Minus size={15}/></button><input aria-label={label} type="number" min={1} max={max} value={value} disabled={disabled} onChange={event=>{ const number=Number(event.target.value); if(Number.isInteger(number)&&number>=1&&number<=max)onChange(number); }}/><button type="button" onClick={()=>onChange(value+1)} disabled={disabled||value>=max} aria-label={`Increase ${label.toLowerCase()}`}><Plus size={15}/></button></div>;
}

export function AddToBag({edition,enabled}:{edition:Edition;enabled:boolean}) {
  const {add,ready}=useCart(); const [quantity,setQuantity]=useState(1); const [added,setAdded]=useState(false);
  if(!enabled) return <p className="notice">Direct orders are currently paused. <Link href="/contact">Contact us</Link> for availability.</p>;
  if(edition.stock<=0) return <p className="notice">This edition is currently unavailable. <Link href="/contact">Ask about a copy</Link>.</p>;
  return <div className="purchase-controls"><label className="field-label">Copies</label><div className="purchase-row"><Quantity value={quantity} max={Math.min(10,edition.stock)} onChange={value=>{setQuantity(value);setAdded(false);}}/><button className="button" disabled={!ready} onClick={()=>{add(edition.id,quantity);setAdded(true);}}>{added?<Check size={18}/>:<ShoppingBag size={18}/>} {added?'Added to your bag':'Add to bag'}</button></div><div aria-live="polite">{added&&<Link className="text-link" href="/checkout">Continue to your order <ArrowRight size={17}/></Link>}</div></div>;
}
