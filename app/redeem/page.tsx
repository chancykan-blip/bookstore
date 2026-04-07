'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function RedeemContent() {
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('success') === '1'
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleRedeem = async () => {
    if (!key.trim()) return
    setLoading(true); setError(''); setResult(null)
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error || '兑换失败')
    else setResult(data)
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
    <div style={{ minHeight: '100vh', background: '#f7f5f0', fontFamily: 'Cormorant Garamond, serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f5f0; -webkit-font-smoothing: antialiased; }
        .key-input { width: 100%; background: white; border: 1px solid rgba(26,26,26,0.15); color: #1a1a1a; padding: 16px 20px; font-family: 'DM Mono', monospace; font-size: 1rem; letter-spacing: 0.12em; outline: none; text-transform: uppercase; transition: border-color 0.2s; }
        .key-input:focus { border-color: #1a1a1a; }
        .key-input::placeholder { color: rgba(26,26,26,0.2); text-transform: none; letter-spacing: 0.05em; font-size: 0.85rem; }
        .submit-btn { width: 100%; background: #1a1a1a; color: #f7f5f0; border: none; padding: 16px; font-family: 'Instrument Sans', sans-serif; font-size: 0.85rem; font-weight: 500; letter-spacing: 0.05em; cursor: pointer; transition: opacity 0.2s; }
        .submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .download-btn { background: #2d6a55; color: white; border: none; padding: 12px 24px; font-family: 'Instrument Sans', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; letter-spacing: 0.05em; transition: opacity 0.2s; }
        .download-btn:hover { opacity: 0.85; }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(26,26,26,0.08)', background: 'rgba(247,245,240,0.92)', backdropFilter: 'blur(16px)', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: '#888', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← 返回商店</Link>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1a1a1a' }}>资源书店</span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Success banner */}
          {justPaid && (
            <div style={{ background: 'white', border: '1px solid rgba(45,106,85,0.2)', borderLeft: '3px solid #2d6a55', padding: '16px 20px', marginBottom: '40px', display: 'flex', gap: '12px' }}>
              <span style={{ color: '#2d6a55', fontSize: '1rem', lineHeight: 1 }}>✓</span>
              <div>
                <p style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#2d6a55', marginBottom: '4px' }}>支付成功！</p>
                <p style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: '0.78rem', color: '#666', fontWeight: 300 }}>授权码已发送到您的邮箱，请在下方输入。</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '12px' }}>授权码兑换</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.0, color: '#1a1a1a', marginBottom: '12px' }}>
              输入<br /><em style={{ color: '#888' }}>授权码</em>
            </h1>
            <p style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: '0.82rem', color: '#888', lineHeight: 1.75, fontWeight: 300 }}>
              格式：BOOK-XXXX-XXXX-XXXX<br />每个授权码最多可下载 3 次
            </p>
          </div>

          {/* Input */}
          <div style={{ marginBottom: '12px' }}>
            <input
              className="key-input"
              value={key}
              onChange={e => { setKey(e.target.value); setError(''); setResult(null); }}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
              placeholder="BOOK-XXXX-XXXX-XXXX"
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'white', border: '1px solid rgba(180,60,60,0.2)', borderLeft: '3px solid #b43c3c', padding: '12px 16px', marginBottom: '12px' }}>
              <p style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: '0.78rem', color: '#b43c3c', fontWeight: 400 }}>{error}</p>
            </div>
          )}

          <button className="submit-btn" onClick={handleRedeem} disabled={loading || !key.trim()} style={{ marginBottom: '32px' }}>
            {loading ? '验证中...' : '验证并获取下载链接 →'}
          </button>

          {/* Result */}
          {result && (
            <div style={{ background: 'white', border: '1px solid rgba(45,106,85,0.15)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ color: '#2d6a55', fontSize: '1rem' }}>✓</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: '#2d6a55', letterSpacing: '0.1em', textTransform: 'uppercase' }}>授权码有效</span>
              </div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '8px' }}>
                {result.resource?.title}
              </h3>
              {result.resource?.description && (
                <p style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: '0.78rem', color: '#888', lineHeight: 1.6, marginBottom: '20px', fontWeight: 300 }}>
                  {result.resource.description}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(26,26,26,0.07)' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '0.05em' }}>
                  剩余 {result.remaining} 次下载
                </span>
                <button className="download-btn" onClick={handleDownload}>
                  下载文件 ↓
                </button>
              </div>
            </div>
          )}

          {/* Bottom link */}
          <div style={{ marginTop: '48px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(26,26,26,0.07)' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: '#bbb', letterSpacing: '0.05em' }}>
              还没有授权码？<Link href="/" style={{ color: '#888', textDecoration: 'none' }}> 浏览资源 →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RedeemPage() {
  return <Suspense><RedeemContent /></Suspense>
}