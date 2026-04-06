'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Resource = {
  id: string
  title: string
  description: string
  cover_url: string
  price: number
  currency: string
  category: string
  tags: string[]
}

export default function StorePage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    supabase.from('resources').select('*').eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setResources(data); setLoading(false) })
  }, [])

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))]
  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || r.category === category
    return matchSearch && matchCat
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; text-decoration: none; color: inherit; display: block; }
        .card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .tag { font-family: 'JetBrains Mono', monospace; font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border: 1px solid rgba(255,255,255,0.1); color: rgba(232,228,220,0.4); border-radius: 2px; }
        input, select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8e4dc; padding: 10px 16px; font-family: 'Inter', sans-serif; font-size: 0.85rem; outline: none; }
        input:focus, select:focus { border-color: rgba(255,255,255,0.3); }
        .btn { font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 500; padding: 10px 24px; cursor: pointer; letter-spacing: 0.05em; border: none; transition: opacity 0.2s; }
        .cat-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(232,228,220,0.5); padding: 6px 16px; font-size: 0.72rem; cursor: pointer; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.2s; }
        .cat-btn.active { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); color: #e8e4dc; }
        .cover-placeholder { width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: rgba(255,255,255,0.15); letter-spacing: 0.1em; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 400, letterSpacing: '-0.02em' }}>
            资源书店
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/redeem" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#c8b8a2', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              兑换授权码 →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '60px 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c9e8f', marginBottom: '16px' }}>Digital Resources</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '20px' }}>
            精选电子资源<br /><em style={{ color: 'rgba(200,184,162,0.6)' }}>即买即用</em>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(232,228,220,0.5)', maxWidth: '480px', lineHeight: 1.8 }}>
            购买后自动生成授权码，输入授权码即可下载。安全、快速、无需注册。
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '24px 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索资源..." style={{ width: '240px' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} className={`cat-btn${category === cat ? ' active' : ''}`} onClick={() => setCategory(cat)}>
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'rgba(232,228,220,0.25)', marginLeft: 'auto' }}>
            {filtered.length} 个资源
          </span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(232,228,220,0.3)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(232,228,220,0.3)' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 300, marginBottom: '8px' }}>暂无资源</p>
            <p style={{ fontSize: '0.82rem' }}>请稍后再来</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map(r => (
              <Link key={r.id} href={`/resource/${r.id}`} className="card">
                <div style={{ background: '#1a1a24' }} className="cover-placeholder">
                  {r.cover_url
                    ? <img src={r.cover_url} alt={r.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    : <span>NO COVER</span>
                  }
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span className="tag">{r.category}</span>
                    {r.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 400, marginBottom: '8px', lineHeight: 1.3 }}>{r.title}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(232,228,220,0.45)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {r.description?.slice(0, 80)}{r.description?.length > 80 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 500, color: '#c8b8a2' }}>
                      {r.price === 0 ? 'FREE' : `${r.currency?.toUpperCase() || 'USD'} ${r.price}`}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'rgba(232,228,220,0.3)', letterSpacing: '0.05em' }}>
                      查看详情 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 2rem', marginTop: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'rgba(232,228,220,0.2)' }}>
            © 2026 资源书店
          </span>
          <Link href="/redeem" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'rgba(232,228,220,0.3)', textDecoration: 'none' }}>
            已购买？兑换授权码 →
          </Link>
        </div>
      </footer>
    </div>
  )
}
