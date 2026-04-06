import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { key } = await req.json()

  if (!key) return NextResponse.json({ error: '请输入授权码' }, { status: 400 })

  const { data: license, error } = await supabaseAdmin
    .from('license_keys')
    .select('*, resources(*)')
    .eq('key', key.toUpperCase().trim())
    .single()

  if (error || !license) {
    return NextResponse.json({ error: '授权码无效' }, { status: 404 })
  }

  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return NextResponse.json({ error: '授权码已过期' }, { status: 403 })
  }

  if (license.download_count >= license.max_downloads) {
    return NextResponse.json({ error: `下载次数已达上限（${license.max_downloads}次）` }, { status: 403 })
  }

  const { data: signedUrl, error: signError } = await supabaseAdmin
    .storage
    .from('resources')
    .createSignedUrl(license.resources.file_url, 3600)

  if (signError || !signedUrl) {
    return NextResponse.json({ error: '文件生成失败，请联系管理员' }, { status: 500 })
  }

  await supabaseAdmin
    .from('license_keys')
    .update({
      download_count: license.download_count + 1,
      is_used: true,
      used_at: license.used_at || new Date().toISOString(),
    })
    .eq('id', license.id)

  await supabaseAdmin.from('downloads').insert({
    license_key_id: license.id,
    resource_id: license.resource_id,
  })

  return NextResponse.json({
    url: signedUrl.signedUrl,
    file_name: license.resources.file_name || license.resources.title,
    remaining: license.max_downloads - license.download_count - 1,
    resource: {
      title: license.resources.title,
      description: license.resources.description,
    }
  })
}
