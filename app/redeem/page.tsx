'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RedeemContent() {
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('success') === '1'

  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleRedeem = async () => {
    if (!key.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || '兑换失败')
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  const handleDownload = () => {
    if (result?.url) {
      const a = document.createElement('a')
      a.href = result.url
      a.download = result.file_name || 'download'
      a.click()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: #e8e4dc; padding: 14px 20px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; letter-spacing: 0.1em; outline: none; width: 100%; text-transform: uppercase; }
        input:focus { border-color: rgba(200,184,162,0.5); }
        input::placeholder { color: rgba(232,228,220,0.2); text-transform: none; letter-spacing: 0.05em; }
      `}</style>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'rgba(232,228,220,0.4)', textDecoration: 'none' }}>← 返回商店</Link>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 400 }}>资源书店</span>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>

          {justPaid && (
            <div style={{ background: 'rgba(124,158,143,0.1)', border: '1px solid rgba(124,158,143,0.3)', padding: '16px 20px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: '#7c9e8f', fontSize: '1rem' }}>✓</span>
              <div>
                <p style={{ fontSize: '0.85rem', color: '#7c9e8f', fontWeight: 500, marginBottom: '4px' }}>支付成功！</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.5)' }}>授权码已发送到您的邮箱，请在下方输入兑换。</p>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c9e8f' }}>授权码兑换</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            输入授权码
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(232,228,220,0.45)', lineHeight: 1.7, marginBottom: '40px' }}>
            购买后您会收到一个授权码。格式为 BOOK-XXXX-XXXX-XXXX，每个授权码可下载 3 次。
          </p>

          <div style={{ marginBottom: '12px' }}>
            <input
              value={key}
              onChange={e => { setKey(e.target.value); setError(''); setResult(null); }}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
              placeholder="BOOK-XXXX-XXXX-XXXX"
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.25)', padding: '12px 16px', marginBottom: '12px' }}>
              <p style={{ fontSize: '0.78rem', color: '#e08080' }}>{error}</p>
            </div>
          )}

          <button onClick={handleRedeem} disabled={loading || !key.trim()}
            style={{ width: '100%', background: '#e8e4dc', color: '#0a0a0f', padding: '14px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.05em', border: 'none', cursor: loading || !key.trim() ? 'not-allowed' : 'pointer', opacity: loading || !key.trim() ? 0.5 : 1, marginBottom: '32px' }}>
            {loading ? '验证中...' : '验证并获取下载链接 →'}
          </button>

          {result && (
            <div style={{ background: 'rgba(124,158,143,0.06)', border: '1px solid rgba(124,158,143,0.2)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ color: '#7c9e8f', fontSize: '1.1rem' }}>✓</span>
                <span style={{ fontSize: '0.78rem', color: '#7c9e8f', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>授权码有效</span>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontWeight: 400, marginBottom: '8px' }}>{result.resource?.title}</h3>
              {result.resource?.description && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.45)', marginBottom: '16px', lineHeight: 1.6 }}>{result.resource.description}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: 'rgba(232,228,220,0.3)' }}>
                  剩余 {result.remaining} 次下载
                </span>
                <button onClick={handleDownload}
                  style={{ background: '#7c9e8f', color: '#0a0a0f', padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                  下载文件 ↓
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(232,228,220,0.25)', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.8 }}>
              没有授权码？先去<Link href="/" style={{ color: '#c8b8a2', textDecoration: 'none' }}> 浏览资源 </Link>购买
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RedeemPage() {
  return (
    <Suspense>
      <RedeemContent />
    </Suspense>
  )
}
