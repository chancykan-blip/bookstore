import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateLicenseKey } from '@/lib/license'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const resourceId = session.metadata?.resource_id
    const customerEmail = session.customer_email || session.customer_details?.email

    if (!resourceId) return NextResponse.json({ received: true })

    // 生成授权码
    const key = generateLicenseKey()
    const { data: license } = await supabaseAdmin
      .from('license_keys')
      .insert({
        key,
        resource_id: resourceId,
        max_downloads: 3,
        customer_email: customerEmail,
        stripe_session_id: session.id,
      })
      .select('*, resources(title)')
      .single()

    // 发送邮件
    if (customerEmail && license) {
      await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: customerEmail,
        subject: `您的下载授权码 — ${license.resources.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
            <h2 style="color:#111;">感谢您的购买！</h2>
            <p>您购买的资源：<strong>${license.resources.title}</strong></p>
            <p>您的授权码：</p>
            <div style="background:#f5f5f5;border:1px solid #e0e0e0;padding:16px;text-align:center;font-size:20px;letter-spacing:2px;font-weight:bold;margin:16px 0;">
              ${key}
            </div>
            <p>请前往以下地址输入授权码下载：</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/redeem" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;">
              立即下载 →
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px;">授权码可使用 3 次，请妥善保管。</p>
          </div>
        `,
      })
    }
  }

  return NextResponse.json({ received: true })
}
