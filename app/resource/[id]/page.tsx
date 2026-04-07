'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ResourcePage() {
  const { id } = useParams()
  const [resource, setResource] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    supabase.from('resources').select('*').eq('id', id).single()
      .then(({ data }) => { setResource(data); setLoading(false) })
    setTimeout(() => setVisible(true), 80)
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
    <div style={{ minHeight: '100vh', background: '#f7f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#bbb', letterSpacing: '0.1em' }}>Loading...</span>
    </div>
  )

  if (!resource) return (
    <div style={{ minHeight: '100vh', background: '#f7f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontStyle: 'italic', color: '#1a1a1a' }}>资源不存在</p>
      <Link href="/" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#888', textDecoration: 'none', letterSpacing: '0.1em' }}>← 返回首页</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f0', fontFamily: 'Cormorant Garamond, serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f5f0; -webkit-font-smoothing: antialiased; }
        .page-enter { opacity: 0; transform: translateY(16px); transition: all 0.7s cubic-bezier(0.16,1,0.3,1); }
        .page-enter.visible { opacity: 1; transform: translateY(0); }
        .tag { font-family: 'DM Mono', monospace; font-size: 0.55rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border: 1px solid rgba(26,26,26,0.12); color: #aaa; }
        .buy-btn { width: 100%; background: #1a1a1a; color: #f7f5f0; border: none; padding: 16px; font-family: 'Instrument Sans', sans-serif; font-size: 0.85rem; font-weight: 500; letter-spacing: 0.05em; cursor: pointer; transition: opacity 0.2s; }
        .buy-btn:hover { opacity: 0.85; }
        .buy-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .free-btn { display: block; text-align: center; background: none; border: 1px solid #1a1a1a; color: #1a1a1a; padding: 15px; font-family: 'Instrument Sans', sans-serif; font-size: 0.85rem; font-weight: 400; letter-spacing: 0.05em; text-decoration: none; transition: all 0.2s; }
        .free-btn:hover { background: #1a1a1a; color: #f7f5f0; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(26,26,26,0.07); }
        .info-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #aaa; letter-spacing: 0.05em; }
        .info-value { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #1a1a1a; letter-spacing: 0.05em; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(247,245,240,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
        <Link href="/" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#888', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← 返回</Link>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1a1a1a' }}>Weekly</span>
      </nav>

      <div className={`page-enter${visible ? ' visible' : ''}`} style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'start' }}>

          {/* Cover */}
          <div style={{ position: 'sticky', top: '96px' }}>
            <div style={{ background: '#ede9e2', aspectRatio: '3/4', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {resource.cover_url
                ? <img src={resource.cover_url} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'rgba(26,26,26,0.2)', letterSpacing: '0.1em' }}>NO COVER</span>
              }
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span className="tag">{resource.category}</span>
              {resource.tags?.map((t: string) => <span key={t} className="tag">{t}</span>)}
            </div>

            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#1a1a1a', marginBottom: '24px' }}>
              {resource.title}
            </h1>

            <p style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: '#555', lineHeight: 1.85, marginBottom: '40px' }}>
              {resource.description}
            </p>

            {/* Info rows */}
            <div style={{ marginBottom: '32px' }}>
              <div className="info-row">
                <span className="info-label">格式</span>
                <span className="info-value">{resource.file_name?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
              </div>
              {resource.file_size && (
                <div className="info-row">
                  <span className="info-label">文件大小</span>
                  <span className="info-value">{resource.file_size}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">下载次数</span>
                <span className="info-value">最多 3 次</span>
              </div>
              <div className="info-row">
                <span className="info-label">有效期</span>
                <span className="info-value">永久有效</span>
              </div>
            </div>

            {/* Price + CTA */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                {resource.price === 0 ? 'Free' : `${resource.currency?.toUpperCase()} ${Number(resource.price).toFixed(2)}`}
              </div>
              {resource.price === 0 ? (
                <Link href="/redeem" className="free-btn">免费获取 →</Link>
              ) : (
                <button className="buy-btn" onClick={handleBuy} disabled={buying}>
                  {buying ? '跳转支付中...' : '立即购买 →'}
                </button>
              )}
            </div>

            <p style={{ textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#bbb', letterSpacing: '0.05em' }}>
              已有授权码？<Link href="/redeem" style={{ color: '#888', textDecoration: 'none' }}> 直接兑换 →</Link>
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(26,26,26,0.07)' }}>
              {['安全支付', '即时授权', '永久有效'].map(b => (
                <div key={b} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}