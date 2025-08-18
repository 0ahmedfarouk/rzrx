import * as jose from 'jose'; import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
export default async function h(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const token=(req.headers.authorization||'').replace('Bearer ','');
    if(!token) return res.status(401).json({error:'No token'});
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const user_id = payload.user_id;
    const { product_id } = req.body||{}; if(!product_id) return res.status(400).json({error:'Missing product_id'});
    const { data: product } = await s.from('products').select('id,price,active').eq('id',product_id).eq('active',true).single();
    if(!product) return res.status(404).json({error:'Product not found or inactive'});
    const { data: user } = await s.from('users').select('id,credits').eq('id',user_id).single();
    if(!user) return res.status(404).json({error:'User not found'});
    if((user.credits||0) < product.price) return res.status(400).json({error:'Not enough credits'});
    const newCredits = (user.credits||0) - product.price;
    const { error: uerr } = await s.from('users').update({ credits:newCredits }).eq('id',user_id);
    if(uerr) return res.status(500).json({error:'Failed to update credits'});
    const { error: terr } = await s.from('transactions').insert([{ user_id, product_id, amount: product.price }]);
    if(terr) return res.status(500).json({error:'Failed to record transaction'});
    res.status(200).json({ ok:true, credits:newCredits, product_id });
  }catch{ res.status(401).json({error:'Invalid token'}); }
}