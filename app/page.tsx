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
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    supabase.from('resources').select('*').eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setResources(data); setLoading(false) })
    setTimeout(() => setVisible(true), 80)
  }, [])

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))]
  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || r.category === category
    return matchSearch && matchCat
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f0', color: '#1a1a1a', fontFamily: "'Editorial New', 'Cormorant Garamond', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #f7f5f0; -webkit-font-smoothing: antialiased; }

        .page-enter { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1); }
        .page-enter.visible { opacity: 1; transform: translateY(0); }

        /* Nav */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 48px; height: 64px; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease; }
        .nav.scrolled { background: rgba(247,245,240,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(26,26,26,0.08); }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 500; color: #1a1a1a; letter-spacing: -0.02em; text-decoration: none; cursor: pointer; background: none; border: none; }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-link { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: #888; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #1a1a1a; }
        .nav-cta { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: #f7f5f0; background: #1a1a1a; padding: 8px 20px; text-decoration: none; transition: opacity 0.2s; }
        .nav-cta:hover { opacity: 0.8; }

        /* Hero */
        .hero { padding: 140px 48px 80px; max-width: 1300px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: end; }
        .hero-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: #888; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
        .hero-eyebrow::before { content: ''; width: 24px; height: 1px; background: #888; }
        .hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 300; line-height: 1.0; letter-spacing: -0.04em; color: #1a1a1a; }
        .hero-title em { font-style: italic; color: #888; }
        .hero-right { padding-bottom: 8px; }
        .hero-desc { font-family: 'Instrument Sans', sans-serif; font-size: 0.95rem; font-weight: 300; color: #555; line-height: 1.85; max-width: 380px; margin-bottom: 32px; }
        .hero-stats { display: flex; gap: 32px; padding-top: 24px; border-top: 1px solid rgba(26,26,26,0.1); }
        .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 400; color: #1a1a1a; line-height: 1; }
        .stat-label { font-family: 'DM Mono', monospace; font-size: 0.58rem; color: #aaa; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }

        /* Marquee */
        .marquee-wrap { overflow: hidden; border-top: 1px solid rgba(26,26,26,0.1); border-bottom: 1px solid rgba(26,26,26,0.1); padding: 14px 0; background: #1a1a1a; }
        .marquee-inner { display: flex; width: max-content; animation: marquee 30s linear infinite; }
        .marquee-item { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-style: italic; color: rgba(247,245,240,0.5); white-space: nowrap; padding: 0 32px; }
        .marquee-dot { color: #c8b8a2; font-style: normal; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* Filters */
        .filters { max-width: 1300px; margin: 0 auto; padding: 40px 48px 24px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .search-input { font-family: 'DM Mono', monospace; font-size: 0.75rem; background: white; border: 1px solid rgba(26,26,26,0.12); color: #1a1a1a; padding: 10px 16px; outline: none; width: 220px; letter-spacing: 0.02em; transition: border-color 0.2s; }
        .search-input:focus { border-color: #1a1a1a; }
        .search-input::placeholder { color: #bbb; }
        .cat-btn { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; background: none; border: 1px solid rgba(26,26,26,0.12); color: #888; padding: 8px 16px; cursor: pointer; transition: all 0.2s; }
        .cat-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .cat-btn.active { background: #1a1a1a; border-color: #1a1a1a; color: #f7f5f0; }
        .count { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #bbb; margin-left: auto; letter-spacing: 0.05em; }

        /* Grid */
        .grid-wrap { max-width: 1300px; margin: 0 auto; padding: 8px 48px 80px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2px; }

        /* Card */
        .card { background: white; text-decoration: none; color: inherit; display: block; position: relative; overflow: hidden; transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-4px); }
        .card:hover .card-arrow { opacity: 1; transform: translate(0, 0); }
        .card:hover .cover-img { transform: scale(1.03); }
        .cover-wrap { height: 240px; overflow: hidden; background: #ede9e2; position: relative; }
        .cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .cover-placeholder span { font-family: 'DM Mono', monospace; font-size: 0.55rem; color: rgba(26,26,26,0.2); letter-spacing: 0.15em; text-transform: uppercase; }
        .card-body { padding: 20px 24px 24px; }
        .card-cat { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; margin-bottom: 8px; }
        .card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 400; color: #1a1a1a; line-height: 1.2; margin-bottom: 8px; letter-spacing: -0.01em; }
        .card-desc { font-family: 'Instrument Sans', sans-serif; font-size: 0.78rem; color: #888; line-height: 1.65; margin-bottom: 16px; font-weight: 300; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid rgba(26,26,26,0.07); }
        .card-price { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 500; color: #1a1a1a; }
        .card-arrow { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #1a1a1a; opacity: 0; transform: translate(-4px, 4px); transition: all 0.2s ease; letter-spacing: 0.05em; }
        .tag { font-family: 'DM Mono', monospace; font-size: 0.55rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border: 1px solid rgba(26,26,26,0.1); color: #aaa; }

        /* Empty state */
        .empty { text-align: center; padding: 100px 48px; }
        .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 300; color: #1a1a1a; margin-bottom: 8px; font-style: italic; }
        .empty-sub { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #bbb; letter-spacing: 0.1em; }

        /* Footer */
        footer { border-top: 1px solid rgba(26,26,26,0.08); padding: 24px 48px; background: #1a1a1a; }
        .footer-inner { max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .footer-copy { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: rgba(247,245,240,0.3); letter-spacing: 0.05em; }
        .footer-link { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: rgba(247,245,240,0.4); text-decoration: none; letter-spacing: 0.05em; transition: color 0.2s; }
        .footer-link:hover { color: rgba(247,245,240,0.8); }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; gap: 40px; padding: 120px 24px 60px; }
          .nav { padding: 0 24px; }
          .filters { padding: 32px 24px 16px; }
          .grid-wrap { padding: 8px 24px 60px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
          footer { padding: 20px 24px; }
        }
      `}</style>

      {/* Nav */}
      <NavBar />

      {/* Hero */}
      <div className={`page-enter${visible ? ' visible' : ''}`}>
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Digital Resources</div>
            <h1 className="hero-title">
              精选<br />
              数字资源<br />
              <em>即买即用</em>
            </h1>
          </div>
          <div className="hero-right">
            <p className="hero-desc">
              购买后立即获得授权码，输入授权码即可下载。无需注册账号，安全快速，支持多次下载。
            </p>
            <div className="hero-stats">
              <div>
                <div className="stat-num">{resources.length}</div>
                <div className="stat-label">资源</div>
              </div>
              <div>
                <div className="stat-num">3×</div>
                <div className="stat-label">下载次数</div>
              </div>
              <div>
                <div className="stat-num">即时</div>
                <div className="stat-label">授权</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          {['电子书', 'E-Book', '课程资料', 'Templates', '设计资源', 'Digital Downloads', '即买即用', 'Instant Access', '电子书', 'E-Book', '课程资料', 'Templates', '设计资源', 'Digital Downloads', '即买即用', 'Instant Access'].map((item, i) => (
            <span key={i} className="marquee-item">{item} <span className="marquee-dot">·</span></span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索资源..." />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} className={`cat-btn${category === cat ? ' active' : ''}`} onClick={() => setCategory(cat)}>
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
        <span className="count">{filtered.length} 个资源</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="empty"><p className="empty-sub">Loading...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p className="empty-title">暂无资源</p>
          <p className="empty-sub">请稍后再来</p>
        </div>
      ) : (
        <div className="grid-wrap">
          {filtered.map((r, i) => (
            <Link key={r.id} href={`/resource/${r.id}`} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="cover-wrap">
                {r.cover_url
                  ? <img src={r.cover_url} alt={r.title} className="cover-img" />
                  : <div className="cover-placeholder"><span>No Cover</span></div>
                }
              </div>
              <div className="card-body">
                <div className="card-cat">{r.category}</div>
                <h3 className="card-title">{r.title}</h3>
                <p className="card-desc">{r.description?.slice(0, 72)}{r.description?.length > 72 ? '...' : ''}</p>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {r.tags?.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
                <div className="card-footer">
                  <span className="card-price">
                    {r.price === 0 ? 'Free' : `${r.currency?.toUpperCase()} ${Number(r.price).toFixed(2)}`}
                  </span>
                  <span className="card-arrow">查看 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <footer>
        <div className="footer-inner">
          <span className="footer-copy">© 2026 资源书店</span>
          <Link href="/redeem" className="footer-link">已购买？兑换授权码 →</Link>
        </div>
      </footer>
    </div>
  )
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="nav-logo">资源书店</Link>
      <div className="nav-links">
        <Link href="/" className="nav-link">首页</Link>
        <Link href="/redeem" className="nav-cta">兑换授权码</Link>
      </div>
    </nav>
  )
}