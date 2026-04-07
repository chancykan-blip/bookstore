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
    const customerName = session.customer_details?.name || '顾客'

    if (!resourceId) return NextResponse.json({ received: true })

    // 生成授权码
    const key = generateLicenseKey()
    const { data: license, error } = await supabaseAdmin
      .from('license_keys')
      .insert({
        key,
        resource_id: resourceId,
        max_downloads: 3,
        customer_email: customerEmail,
        stripe_session_id: session.id,
      })
      .select('*, resources(title, description)')
      .single()

    if (error || !license) {
      console.error('License creation failed:', error)
      return NextResponse.json({ error: 'License creation failed' }, { status: 500 })
    }

    // 发送邮件
    if (customerEmail) {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: customerEmail,
          subject: `您的授权码 — ${license.resources.title}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:white;border:1px solid rgba(26,26,26,0.08);">
    
    <!-- Header -->
    <div style="background:#1a1a1a;padding:28px 36px;">
      <p style="margin:0;font-size:13px;color:rgba(247,245,240,0.5);letter-spacing:0.15em;text-transform:uppercase;font-family:monospace;">资源书店</p>
    </div>

    <!-- Body -->
    <div style="padding:36px;">
      <p style="font-size:13px;color:#aaa;letter-spacing:0.12em;text-transform:uppercase;font-family:monospace;margin:0 0 12px;">Purchase Confirmed</p>
      <h1 style="font-size:28px;font-weight:300;color:#1a1a1a;margin:0 0 8px;letter-spacing:-0.02em;line-height:1.1;">感谢您的购买</h1>
      <p style="font-size:14px;color:#888;margin:0 0 32px;">Hi ${customerName}，您的授权码已生成</p>

      <div style="background:#f7f5f0;border-left:3px solid #1a1a1a;padding:16px 20px;margin-bottom:32px;">
        <p style="font-size:11px;color:#aaa;letter-spacing:0.1em;text-transform:uppercase;font-family:monospace;margin:0 0 8px;">您购买的资源</p>
        <p style="font-size:16px;color:#1a1a1a;font-weight:400;margin:0;">${license.resources.title}</p>
      </div>

      <p style="font-size:12px;color:#aaa;letter-spacing:0.1em;text-transform:uppercase;font-family:monospace;margin:0 0 10px;">您的授权码</p>
      <div style="background:#1a1a1a;padding:20px;text-align:center;margin-bottom:32px;">
        <p style="font-family:monospace;font-size:20px;letter-spacing:0.15em;color:#f7f5f0;margin:0;font-weight:400;">${key}</p>
      </div>

      <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 24px;">
        请前往下方链接，输入授权码即可下载资源。<br>
        每个授权码最多可下载 <strong>3 次</strong>，请妥善保管。
      </p>

      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/redeem" 
         style="display:block;background:#1a1a1a;color:#f7f5f0;text-align:center;padding:14px;text-decoration:none;font-size:13px;letter-spacing:0.08em;font-family:monospace;">
        前往兑换下载 →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:20px 36px;border-top:1px solid rgba(26,26,26,0.07);">
      <p style="font-size:11px;color:#ccc;margin:0;font-family:monospace;letter-spacing:0.05em;">
        如有问题请回复此邮件 · © 2026 Weekly书店
      </p>
    </div>

  </div>
</body>
</html>
          `,
        })
        console.log('Email sent to:', customerEmail)
      } catch (emailError) {
        console.error('Email send failed:', emailError)
        // 邮件发送失败不影响授权码生成，继续返回成功
      }
    }
  }

  return NextResponse.json({ received: true })
}