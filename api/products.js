import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
export default async function h(_req,res){
  const { data, error } = await s.from('products').select('*').eq('active', true).order('name',{ascending:true});
  if(error) return res.status(500).json({error:error.message}); res.status(200).json(data||[]);
}