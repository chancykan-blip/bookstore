'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ResourcePage() {
  const { id } = useParams()
  const router = useRouter()
  const [resource, setResource] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    supabase.from('resources').select('*').eq('id', id).single()
      .then(({ data }) => { setResource(data); setLoading(false) })
  }, [id])

  const handleBuy = async () => {
    setBuying(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource_id: id }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setBuying(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(232,228,220,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>
      Loading...
    </div>
  )

  if (!resource) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ color: '#e8e4dc', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>资源不存在</p>
      <Link href="/" style={{ color: '#c8b8a2', fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace' }}>← 返回首页</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tag { font-family: 'JetBrains Mono', monospace; font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border: 1px solid rgba(255,255,255,0.1); color: rgba(232,228,220,0.4); border-radius: 2px; }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'rgba(232,228,220,0.4)', textDecoration: 'none' }}>← 返回</Link>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 400 }}>资源书店</span>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '60px', alignItems: 'start' }}>
          {/* Cover */}
          <div>
            <div style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {resource.cover_url
                ? <img src={resource.cover_url} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>NO COVER</span>
              }
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span className="tag">{resource.category}</span>
              {resource.tags?.map((t: string) => <span key={t} className="tag">{t}</span>)}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>
              {resource.title}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(232,228,220,0.55)', lineHeight: 1.85, marginBottom: '40px' }}>
              {resource.description}
            </p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 0', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.4)' }}>格式</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#e8e4dc' }}>{resource.file_name?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.4)' }}>下载次数</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#e8e4dc' }}>最多 3 次</span>
              </div>
              {resource.file_size && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.4)' }}>文件大小</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#e8e4dc' }}>{resource.file_size}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.6rem', fontWeight: 500, color: '#c8b8a2' }}>
                {resource.price === 0 ? 'FREE' : `${resource.currency?.toUpperCase() || 'USD'} ${resource.price}`}
              </span>
            </div>

            {resource.price === 0 ? (
              <Link href="/redeem" style={{ display: 'block', textAlign: 'center', background: '#e8e4dc', color: '#0a0a0f', padding: '14px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.05em', textDecoration: 'none' }}>
                免费获取 →
              </Link>
            ) : (
              <button onClick={handleBuy} disabled={buying}
                style={{ width: '100%', background: '#e8e4dc', color: '#0a0a0f', padding: '14px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.05em', border: 'none', cursor: buying ? 'not-allowed' : 'pointer', opacity: buying ? 0.7 : 1 }}>
                {buying ? '跳转支付中...' : '立即购买 →'}
              </button>
            )}

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.72rem', color: 'rgba(232,228,220,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
              已有授权码？<Link href="/redeem" style={{ color: '#c8b8a2', textDecoration: 'none' }}>直接兑换 →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
