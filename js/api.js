import { API_BASE } from './config.js';
export const getToken = ()=> localStorage.getItem('rzrx_token');
export const setToken = t => localStorage.setItem('rzrx_token', t);
export const clearToken= ()=> localStorage.removeItem('rzrx_token');
export async function api(path, opts={}){
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  const t=getToken(); if(t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(API_BASE+path, { ...opts, headers });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data?.error||'Request failed'); return data;
}
export const listProducts=()=>api('/api/products');
export const getMe=()=>api('/api/auth/me');
export const loginDiscord=()=>{ location.href = API_BASE + '/api/auth/discord/login'; };
export const secureBuy=(product_id)=>api('/api/secure/buy',{method:'POST',body:JSON.stringify({product_id})});
export const adminCredit=(user_id,delta,adminToken)=>api('/api/admin/credit',{method:'POST',headers:{Authorization:`Bearer ${adminToken}`},body:JSON.stringify({user_id,delta})});
