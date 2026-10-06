import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('store_notices').select('id,title,body').eq('active', true).order('created_at', { ascending: false }).limit(3)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notices: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
}
