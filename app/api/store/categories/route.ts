import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(){const supabase=await createClient();const {data,error}=await supabase.from('store_categories').select('id,name,slug').eq('active',true).order('sort_order');if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({categories:data||[]})}
