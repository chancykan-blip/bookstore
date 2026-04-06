import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { resource_id } = await req.json()

  const { data: resource } = await supabaseAdmin
    .from('resources')
    .select('*')
    .eq('id', resource_id)
    .single()

  if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: resource.currency || 'usd',
        product_data: {
          name: resource.title,
          description: resource.description || undefined,
          images: resource.cover_url ? [resource.cover_url] : [],
        },
        unit_amount: Math.round(resource.price * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    customer_email: undefined,
    metadata: { resource_id },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/redeem?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/resource/${resource_id}`,
  })

  return NextResponse.json({ url: session.url })
}
