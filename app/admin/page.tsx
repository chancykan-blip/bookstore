'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PW = typeof window !== 'undefined' ? '' : ''

type Tab = 'resources' | 'licenses' | 'upload'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [tab, setTab] = useState<Tab>('resources')
  const [toast, setToast] = useState('')
  const [adminPw, setAdminPw] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleLogin = () => {
    setAdminPw(pw)
    setAuthed(true)
    setPwError(false)
  }

  if (!authed) return <LoginPage pw={pw} setPw={setPw} pwError={pwError} setPwError={setPwError} onLogin={handleLogin} />

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8e4dc; padding: 10px 14px; font-family: 'Inter', sans-serif; font-size: 0.83rem; outline: none; width: 100%; }
        input:focus, textarea:focus, select:focus { border-color: rgba(200,184,162,0.4); }
        label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(232,228,220,0.35); margin-bottom: 6px; }
        .tab-btn { background: none; border: none; padding: 12px 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; color: rgba(232,228,220,0.4); border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #e8e4dc; border-bottom-color: #c8b8a2; }
        .tab-btn:hover { color: #e8e4dc; }
        .row { display: flex; gap: 12px; }
        .row > * { flex: 1; }
        .action-btn { background: none; border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; color: rgba(232,228,220,0.5); transition: all 0.2s; }
        .action-btn:hover { border-color: rgba(255,255,255,0.3); color: #e8e4dc; }
        .action-btn.danger:hover { border-color: rgba(200,80,80,0.5); color: #e08080; }
        .key-box { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; letter-spacing: 0.12em; padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: border-color 0.2s; }
        .key-box:hover { border-color: rgba(255,255,255,0.2); }
        tr:hover td { background: rgba(255,255,255,0.02); }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#111', color: '#e8e4dc', padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', zIndex: 999, border: '1px solid rgba(255,255,255,0.1)' }}>
          {toast}
        </div>
      )}

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 400 }}>资源书店</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(232,228,220,0.3)', letterSpacing: '0.1em' }}>/ ADMIN</span>
          </div>
          <a href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(232,228,220,0.35)', textDecoration: 'none', letterSpacing: '0.05em' }}>查看前台 →</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0' }}>
          {(['resources', 'upload', 'licenses'] as Tab[]).map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'resources' ? '资源管理' : t === 'upload' ? '上传资源' : '授权码'}
            </button>
          ))}
        </div>

        <div style={{ padding: '32px 0' }}>
          {tab === 'resources' && <ResourcesTab adminPw={adminPw} showToast={showToast} />}
          {tab === 'upload' && <UploadTab adminPw={adminPw} showToast={showToast} onDone={() => setTab('resources')} />}
          {tab === 'licenses' && <LicensesTab adminPw={adminPw} showToast={showToast} />}
        </div>
      </div>
    </div>
  )
}

// ── LOGIN ──
function LoginPage({ pw, setPw, pwError, setPwError, onLogin }: any) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px' }}>
        <div style={{ position: 'relative', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #7c9e8f, #9b8ab4)', marginBottom: '40px' }} />
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,228,220,0.3)', marginBottom: '12px' }}>Admin Portal</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#e8e4dc', marginBottom: '32px', letterSpacing: '-0.02em' }}>管理后台</h1>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(232,228,220,0.3)', marginBottom: '8px' }}>Password</label>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwError(false) }} onKeyDown={e => e.key === 'Enter' && onLogin()}
            placeholder="••••••••"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${pwError ? 'rgba(200,80,80,0.5)' : 'rgba(255,255,255,0.1)'}`, color: '#e8e4dc', padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', outline: 'none' }} />
          {pwError && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#e08080', marginTop: '6px' }}>密码错误</p>}
        </div>
        <button onClick={onLogin} style={{ width: '100%', background: '#e8e4dc', color: '#0a0a0f', border: 'none', padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.05em' }}>
          进入后台 →
        </button>
      </div>
    </div>
  )
}

// ── RESOURCES TAB ──
function ResourcesTab({ adminPw, showToast }: any) {
  const [resources, setResources] = useState<any[]>([])

  const fetch_ = async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
    if (data) setResources(data)
  }

  useEffect(() => { fetch_() }, [])

  const toggleActive = async (r: any) => {
    await supabase.from('resources').update({ active: !r.active }).eq('id', r.id)
    showToast(r.active ? '已下架' : '已上架')
    fetch_()
  }

  const deleteResource = async (id: string) => {
    if (!confirm('确认删除？')) return
    await supabase.from('resources').delete().eq('id', id)
    showToast('已删除')
    fetch_()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '-0.02em' }}>资源列表</h2>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(232,228,220,0.3)', marginTop: '4px' }}>{resources.length} 个资源</p>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['标题', '分类', '价格', '状态', '操作'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,228,220,0.25)', fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '14px 12px' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#e8e4dc' }}>{r.title}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(232,228,220,0.25)', marginTop: '2px' }}>{r.file_name}</div>
              </td>
              <td style={{ padding: '14px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(232,228,220,0.4)', textTransform: 'uppercase' }}>{r.category}</td>
              <td style={{ padding: '14px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#c8b8a2' }}>
                {r.price === 0 ? 'FREE' : `${r.currency?.toUpperCase()} ${r.price}`}
              </td>
              <td style={{ padding: '14px 12px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', padding: '3px 8px', background: r.active ? 'rgba(124,158,143,0.12)' : 'rgba(255,255,255,0.04)', color: r.active ? '#7c9e8f' : 'rgba(232,228,220,0.3)', border: `1px solid ${r.active ? 'rgba(124,158,143,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                  {r.active ? '上架' : '下架'}
                </span>
              </td>
              <td style={{ padding: '14px 12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn" onClick={() => toggleActive(r)}>{r.active ? '下架' : '上架'}</button>
                  <button className="action-btn danger" onClick={() => deleteResource(r.id)}>删除</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {resources.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(232,228,220,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>
          暂无资源，请先上传
        </div>
      )}
    </div>
  )
}

// ── UPLOAD TAB ──
function UploadTab({ adminPw, showToast, onDone }: any) {
  const [form, setForm] = useState({ title: '', description: '', category: 'ebook', price: '0', currency: 'USD', tags: '' })
  const [file, setFile] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!form.title || !file) { showToast('请填写标题并选择文件'); return }
    setUploading(true)
    setProgress('上传文件中...')

    // Upload file
    const fileExt = file.name.split('.').pop()
const filePath = `${Date.now()}.${fileExt}`
    const { error: fileError } = await supabase.storage.from('resources').upload(filePath, file)
    if (fileError) { showToast('文件上传失败: ' + fileError.message); setUploading(false); return }

    // Upload cover
    let coverUrl = ''
    if (cover) {
      setProgress('上传封面中...')
      const coverPath = `${Date.now()}.${cover.name.split('.').pop()}`
      const { data: coverData } = await supabase.storage.from('covers').upload(coverPath, cover)
      if (coverData) {
        const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverPath)
        coverUrl = publicUrl
      }
    }

    setProgress('保存资源信息...')
    const { error: dbError } = await supabase.from('resources').insert({
      title: form.title,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price) || 0,
      currency: form.currency.toLowerCase(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      file_url: filePath,
      file_name: file.name,
      file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      cover_url: coverUrl,
      active: true,
    })

    if (dbError) { showToast('保存失败: ' + dbError.message); setUploading(false); return }

    showToast('✓ 资源上传成功')
    setForm({ title: '', description: '', category: 'ebook', price: '0', currency: 'USD', tags: '' })
    setFile(null); setCover(null)
    setUploading(false); setProgress('')
    onDone()
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '32px' }}>上传新资源</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label>标题 *</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="资源标题" />
        </div>
        <div>
          <label>描述</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="资源描述..." rows={3} style={{ resize: 'vertical', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e4dc', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', outline: 'none', width: '100%' }} />
        </div>
        <div className="row">
          <div>
            <label>分类</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="ebook">电子书</option>
              <option value="course">课程资料</option>
              <option value="template">模板</option>
              <option value="tool">工具</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label>价格</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" min="0" step="0.01" />
          </div>
          <div>
            <label>货币</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
              <option value="NZD">NZD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>
        <div>
          <label>标签（逗号分隔）</label>
          <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="PDF, 设计, 入门" />
        </div>

        {/* File upload */}
        <div>
          <label>资源文件 *</label>
          <div onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${file ? 'rgba(124,158,143,0.4)' : 'rgba(255,255,255,0.1)'}`, padding: '24px', textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(124,158,143,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
            {file ? (
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#7c9e8f', marginBottom: '4px' }}>✓ {file.name}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(232,228,220,0.3)' }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'rgba(232,228,220,0.3)', marginBottom: '4px' }}>点击选择文件</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(232,228,220,0.15)' }}>支持所有格式</p>
              </div>
            )}
          </div>
        </div>

        {/* Cover upload */}
        <div>
          <label>封面图片（可选）</label>
          <div onClick={() => coverRef.current?.click()}
            style={{ border: `2px dashed ${cover ? 'rgba(124,158,143,0.4)' : 'rgba(255,255,255,0.1)'}`, padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setCover(e.target.files?.[0] || null)} />
            {cover ? (
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#7c9e8f' }}>✓ {cover.name}</p>
            ) : (
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'rgba(232,228,220,0.3)' }}>点击上传封面</p>
            )}
          </div>
        </div>

        {progress && (
          <div style={{ background: 'rgba(124,158,143,0.08)', border: '1px solid rgba(124,158,143,0.2)', padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#7c9e8f' }}>
            {progress}
          </div>
        )}

        <button onClick={handleUpload} disabled={uploading}
          style={{ background: '#e8e4dc', color: '#0a0a0f', border: 'none', padding: '14px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, letterSpacing: '0.05em' }}>
          {uploading ? '上传中...' : '上传资源 →'}
        </button>
      </div>
    </div>
  )
}

// ── LICENSES TAB ──
function LicensesTab({ adminPw, showToast }: any) {
  const [licenses, setLicenses] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [form, setForm] = useState({ resource_id: '', quantity: '1', max_downloads: '3', expires_days: '', note: '', customer_email: '' })
  const [generating, setGenerating] = useState(false)
  const [newKeys, setNewKeys] = useState<any[]>([])

  const fetchLicenses = async () => {
    const res = await fetch('/api/licenses', { headers: { 'x-admin-password': adminPw } })
    const data = await res.json()
    if (data.keys) setLicenses(data.keys)
  }

  useEffect(() => {
    fetchLicenses()
    supabase.from('resources').select('id, title').eq('active', true).then(({ data }) => { if (data) setResources(data) })
  }, [])

  const generate = async () => {
    console.log('adminPw:', adminPw) // 加这行
    if (!form.resource_id) { showToast('请选择资源'); return }
    setGenerating(true)
    const res = await fetch('/api/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPw },
      body: JSON.stringify({ ...form, quantity: parseInt(form.quantity), max_downloads: parseInt(form.max_downloads), expires_days: form.expires_days ? parseInt(form.expires_days) : null }),
    })
    const data = await res.json()
    if (data.keys) {
      setNewKeys(data.keys)
      showToast(`✓ 生成了 ${data.keys.length} 个授权码`)
      fetchLicenses()
    }
    setGenerating(false)
  }

  const copyKey = (key: string) => { navigator.clipboard.writeText(key); showToast('已复制') }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '40px', alignItems: 'start' }}>
      {/* Generate form */}
      <div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 300, marginBottom: '24px' }}>生成授权码</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>选择资源 *</label>
            <select value={form.resource_id} onChange={e => setForm({ ...form, resource_id: e.target.value })}>
              <option value="">-- 选择资源 --</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>
          <div className="row">
            <div>
              <label>生成数量</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} min="1" max="100" />
            </div>
            <div>
              <label>下载次数上限</label>
              <input type="number" value={form.max_downloads} onChange={e => setForm({ ...form, max_downloads: e.target.value })} min="1" />
            </div>
          </div>
          <div>
            <label>有效期（天，留空永久）</label>
            <input type="number" value={form.expires_days} onChange={e => setForm({ ...form, expires_days: e.target.value })} placeholder="例如 30" />
          </div>
          <div>
            <label>客户邮箱（可选）</label>
            <input value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} placeholder="customer@email.com" />
          </div>
          <div>
            <label>备注</label>
            <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="例如：微信转账 ¥99" />
          </div>
          <button onClick={generate} disabled={generating}
            style={{ background: '#e8e4dc', color: '#0a0a0f', border: 'none', padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 500, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.6 : 1 }}>
            {generating ? '生成中...' : '生成授权码 →'}
          </button>
        </div>

        {newKeys.length > 0 && (
          <div style={{ marginTop: '24px', background: 'rgba(124,158,143,0.06)', border: '1px solid rgba(124,158,143,0.2)', padding: '16px' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#7c9e8f', marginBottom: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>新生成的授权码</p>
            {newKeys.map(k => (
              <div key={k.id} className="key-box" onClick={() => copyKey(k.key)} style={{ marginBottom: '8px', color: '#e8e4dc' }}>
                {k.key}
                <span style={{ marginLeft: '8px', fontSize: '0.6rem', color: 'rgba(232,228,220,0.3)' }}>点击复制</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Licenses list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 300 }}>授权码列表</h2>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(232,228,220,0.25)' }}>{licenses.length} 个</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
          {licenses.map(l => (
            <div key={l.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="key-box" onClick={() => copyKey(l.key)} style={{ fontSize: '0.72rem', color: '#e8e4dc', flexShrink: 0 }}>{l.key}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', padding: '2px 6px', background: l.is_used ? 'rgba(255,255,255,0.04)' : 'rgba(124,158,143,0.1)', color: l.is_used ? 'rgba(232,228,220,0.3)' : '#7c9e8f', border: `1px solid ${l.is_used ? 'rgba(255,255,255,0.06)' : 'rgba(124,158,143,0.25)'}` }}>
                    {l.is_used ? '已使用' : '未使用'}
                  </span>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(232,228,220,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.resources?.title} · {l.download_count}/{l.max_downloads}次
                  {l.customer_email && ` · ${l.customer_email}`}
                  {l.note && ` · ${l.note}`}
                </p>
              </div>
            </div>
          ))}
          {licenses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(232,228,220,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>暂无授权码</div>
          )}
        </div>
      </div>
    </div>
  )
}
