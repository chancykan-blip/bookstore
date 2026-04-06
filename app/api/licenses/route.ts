import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateLicenseKey } from '@/lib/license'

export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { resource_id, quantity = 1, max_downloads = 3, expires_days, note, customer_email } = await req.json()

  if (!resource_id) {
    return NextResponse.json({ error: 'resource_id required' }, { status: 400 })
  }

  const keys = []
  for (let i = 0; i < quantity; i++) {
    const key = generateLicenseKey()
    const expires_at = expires_days
      ? new Date(Date.now() + expires_days * 86400000).toISOString()
      : null

    const { data, error } = await supabaseAdmin
      .from('license_keys')
      .insert({ key, resource_id, max_downloads, expires_at, note, customer_email })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    keys.push(data)
  }

  return NextResponse.json({ keys })
}

export async function GET(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('license_keys')
    .select('*, resources(title)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ keys: data })
}
