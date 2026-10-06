import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id,name,slug,description,price,product_type,delivery_url,image_url,featured,store_categories(name,slug)')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
}
