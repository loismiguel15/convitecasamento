import { useEffect, useState } from 'react'
import { api } from '../api'
import { Trash2, LogOut, Users, UserCheck, UserX, Download, Gift, Settings } from 'lucide-react'

export default function Admin() {
  const [token, setToken] = useState(sessionStorage.adminToken || '')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('rsvp')
  const [rows, setRows] = useState([])
  const [messages, setMessages] = useState([])
  const [gifts, setGifts] = useState([])
  const [giftForm, setGiftForm] = useState(null)
  const [gallery, setGallery] = useState([])
  const [galleryForm, setGalleryForm] = useState(null)
  const [settings, setSettings] = useState({})
  const [error, setError] = useState('')
  const headers = { Authorization: `Bearer ${token}` }

  const logout = () => { sessionStorage.removeItem('adminToken'); setToken(''); setError('') }
  const load = async () => {
    try {
      const [r, m, g, photos, s] = await Promise.all([api('/rsvp', { headers }), api('/messages'), api('/gifts'), api('/gallery'), api('/settings')])
      setRows(r); setMessages(m); setGifts(g); setGallery(photos); setSettings(s); setError('')
    } catch (e) {
      setError(e.message)
      if (e.message.includes('Sessão')) logout()
    }
  }
  useEffect(() => { if (token) load() }, [token])

  const login = async e => {
    e.preventDefault()
    try {
      const result = await api('/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      sessionStorage.adminToken = result.token
      setToken(result.token); setError('')
    } catch (e) { setError(e.message) }
  }

  if (!token) return <main className="grid min-h-screen place-items-center bg-cream p-5">
    <form onSubmit={login} className="w-full max-w-sm bg-white p-10 text-center shadow-soft">
      <p className="font-display text-4xl text-olive">Painel dos noivos</p>
      <p className="my-6 text-sm text-stone-500">Entre com a senha administrativa.</p>
      <input type="password" required className="field" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <button className="btn mt-6 w-full">Entrar</button>
    </form>
  </main>

  const yes = rows.filter(x => x.attending === 'yes')
  const no = rows.filter(x => x.attending === 'no')
  const companions = yes.reduce((a, x) => a + Number(x.companions), 0)
  const remove = async (type, id) => { await api(`/${type}/${id}`, { method: 'DELETE', headers }); load() }
  const openGift = gift => setGiftForm({ id: gift?.id || null, name: gift?.name || '', price: gift?.price || '', image_url: gift?.image_url || '', file: null, preview: gift?.image_url || '', saving: false })
  const saveGift = async e => {
    e.preventDefault()
    let form = { ...giftForm, saving: true }; setGiftForm(form)
    try {
      let image_url = form.image_url
      if (form.file) {
        const body = new FormData()
        body.append('image', form.file)
        const response = await fetch('/api/upload', { method: 'POST', headers, body })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Não foi possível enviar a imagem.')
        image_url = result.url
      }
      await api('/gifts' + (form.id ? `/${form.id}` : ''), { method: form.id ? 'PUT' : 'POST', headers, body: JSON.stringify({ name: form.name, price: form.price, image_url }) })
      setGiftForm(null); load()
    } catch (error) {
      alert(error.message); setGiftForm({ ...form, saving: false })
    }
  }
  const openGallery = photo => setGalleryForm({ id: photo?.id || null, image_url: photo?.image_url || '', caption: photo?.caption || '', sort_order: photo?.sort_order ?? gallery.length, file: null, preview: photo?.image_url || '', saving: false })
  const saveGallery = async e => {
    e.preventDefault()
    let form = { ...galleryForm, saving: true }; setGalleryForm(form)
    try {
      let image_url = form.image_url
      if (form.file) {
        const body = new FormData()
        body.append('image', form.file)
        const response = await fetch('/api/upload', { method: 'POST', headers, body })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Não foi possível enviar a imagem.')
        image_url = result.url
      }
      await api('/gallery' + (form.id ? `/${form.id}` : ''), { method: form.id ? 'PUT' : 'POST', headers, body: JSON.stringify({ image_url, caption: form.caption, sort_order: form.sort_order }) })
      setGalleryForm(null); load()
    } catch (error) {
      alert(error.message); setGalleryForm({ ...form, saving: false })
    }
  }
  const saveSettings = async e => {
    e.preventDefault()
    await api('/settings', { method: 'PUT', headers, body: JSON.stringify(settings) })
    alert('Informações atualizadas no convite.')
  }
  const labels = { groom: 'Nome completo do noivo', bride: 'Nome completo da noiva', wedding_date: 'Data', wedding_time: 'Horário', venue: 'Local', map_url: 'Link da localização', pix_key: 'Chave PIX', whatsapp: 'WhatsApp com DDI', instagram: 'Link do Instagram', music_url: 'Arquivo ou link da música', story_intro: 'Introdução da história' }

  return <div className="min-h-screen bg-[#f5f3ee]">
    <header className="flex items-center justify-between bg-olive px-6 py-5 text-white">
      <div><p className="font-display text-3xl">L & G</p><small className="text-white/50">Administração do casamento</small></div>
      <button onClick={logout} title="Sair"><LogOut /></button>
    </header>
    <div className="mx-auto max-w-7xl p-5">
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[[Users, 'Total confirmado', yes.length + companions], [UserCheck, 'Responderam sim', yes.length], [UserX, 'Responderam não', no.length], [Users, 'Acompanhantes', companions]].map(([Icon, label, value]) =>
          <div className="flex items-center gap-4 bg-white p-5 shadow-sm" key={label}><Icon className="text-gold" /><div><b className="text-2xl text-olive">{value}</b><p className="text-xs text-stone-500">{label}</p></div></div>)}
      </div>
      <nav className="mb-5 flex flex-wrap gap-2">
        {[['rsvp', 'Confirmações'], ['messages', 'Mensagens'], ['gifts', 'Presentes'], ['gallery', 'Galeria'], ['settings', 'Informações']].map(x =>
          <button onClick={() => setTab(x[0])} className={`rounded-full px-4 py-2 text-xs ${tab === x[0] ? 'bg-olive text-white' : 'bg-white'}`} key={x[0]}>{x[1]}</button>)}
        <a className="ml-auto flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs text-white" href={`/api/export-rsvp?token=${encodeURIComponent(token)}`}><Download size={15} />Exportar CSV</a>
      </nav>
      {tab === 'rsvp' && <div className="overflow-auto bg-white"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-sand/60"><tr>{['Nome', 'WhatsApp', 'Presença', 'Acompanhantes', 'Nomes', 'Mensagem', 'Data', ''].map(x => <th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r => <tr className="border-t" key={r.id}><td className="p-4 font-semibold">{r.name}</td><td>{r.phone}</td><td>{r.attending === 'yes' ? 'Sim' : 'Não'}</td><td>{r.companions}</td><td>{r.companion_names}</td><td>{r.message}</td><td>{new Date(r.created_at + 'Z').toLocaleDateString('pt-BR')}</td><td><button className="text-red-600" onClick={() => remove('rsvp', r.id)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>}
      {tab === 'messages' && <div className="grid gap-3 sm:grid-cols-2">{messages.map(m => <div className="relative bg-white p-6" key={m.id}><b>{m.name}</b><p className="mt-2 text-sm">{m.message}</p><button onClick={() => remove('messages', m.id)} className="absolute right-4 top-4 text-red-600"><Trash2 size={17} /></button></div>)}</div>}
      {tab === 'gifts' && <>
        <button onClick={() => openGift(null)} className="btn mb-4">Cadastrar presente</button>
        {giftForm && <form onSubmit={saveGift} className="mb-6 grid gap-5 bg-white p-6 shadow-sm md:grid-cols-[220px_1fr]">
          <label className="group relative grid min-h-52 cursor-pointer place-items-center overflow-hidden border-2 border-dashed border-gold/40 bg-cream text-center">
            {giftForm.preview ? <img src={giftForm.preview} alt="Prévia do presente" className="absolute inset-0 h-full w-full object-cover" /> : <span className="p-5 text-xs leading-5 text-stone-500">Clique para escolher uma imagem<br />JPG, PNG ou WebP — até 8 MB</span>}
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files[0]; if (file) setGiftForm({ ...giftForm, file, preview: URL.createObjectURL(file) }) }} />
            {giftForm.preview && <span className="relative rounded-full bg-olive/80 px-4 py-2 text-[10px] uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100">Trocar imagem</span>}
          </label>
          <div>
            <label className="label mb-4 block">Nome do presente<input required className="field" value={giftForm.name} onChange={e => setGiftForm({ ...giftForm, name: e.target.value })} /></label>
            <label className="label mb-4 block">Valor<input required min="0.01" step="0.01" type="number" className="field" value={giftForm.price} onChange={e => setGiftForm({ ...giftForm, price: e.target.value })} /></label>
            <label className="label mb-5 block">Ou cole o link de uma imagem<input className="field" value={giftForm.image_url} onChange={e => setGiftForm({ ...giftForm, image_url: e.target.value, preview: e.target.value })} /></label>
            <div className="flex gap-3"><button disabled={giftForm.saving} className="btn">{giftForm.saving ? 'Salvando...' : 'Salvar presente'}</button><button type="button" onClick={() => setGiftForm(null)} className="rounded-full border border-stone-300 px-5 text-xs">Cancelar</button></div>
          </div>
        </form>}
        <div className="grid gap-3 sm:grid-cols-3">{gifts.map(g => <div className="overflow-hidden bg-white" key={g.id}>{g.image_url && <img src={g.image_url} alt={g.name} className="h-36 w-full object-cover" />}<div className="p-5"><Gift className="text-gold" /><b className="mt-3 block">{g.name}</b><p>{Number(g.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><div className="mt-4 flex gap-3"><button onClick={() => openGift(g)}>Editar</button><button className="text-red-600" onClick={() => remove('gifts', g.id)}>Excluir</button></div></div></div>)}</div>
      </>}
      {tab === 'gallery' && <>
        <button onClick={() => openGallery(null)} className="btn mb-4">Adicionar foto</button>
        {galleryForm && <form onSubmit={saveGallery} className="mb-6 grid gap-5 bg-white p-6 shadow-sm md:grid-cols-[260px_1fr]">
          <label className="group relative grid min-h-64 cursor-pointer place-items-center overflow-hidden border-2 border-dashed border-gold/40 bg-cream text-center">
            {galleryForm.preview ? <img src={galleryForm.preview} alt="Prévia da galeria" className="absolute inset-0 h-full w-full object-cover" /> : <span className="p-5 text-xs leading-5 text-stone-500">Clique para escolher uma foto<br />JPG, PNG ou WebP — até 8 MB</span>}
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files[0]; if (file) setGalleryForm({ ...galleryForm, file, preview: URL.createObjectURL(file) }) }} />
            {galleryForm.preview && <span className="relative rounded-full bg-olive/80 px-4 py-2 text-[10px] uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100">Trocar foto</span>}
          </label>
          <div>
            <label className="label mb-4 block">Legenda da foto<input className="field" placeholder="Ex.: Nosso primeiro encontro" value={galleryForm.caption} onChange={e => setGalleryForm({ ...galleryForm, caption: e.target.value })} /></label>
            <label className="label mb-4 block">Ordem de exibição<input min="0" type="number" className="field" value={galleryForm.sort_order} onChange={e => setGalleryForm({ ...galleryForm, sort_order: e.target.value })} /></label>
            <label className="label mb-5 block">Ou cole o link de uma imagem<input className="field" value={galleryForm.image_url} onChange={e => setGalleryForm({ ...galleryForm, image_url: e.target.value, preview: e.target.value })} /></label>
            <div className="flex gap-3"><button disabled={galleryForm.saving} className="btn">{galleryForm.saving ? 'Salvando...' : 'Salvar foto'}</button><button type="button" onClick={() => setGalleryForm(null)} className="rounded-full border border-stone-300 px-5 text-xs">Cancelar</button></div>
          </div>
        </form>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gallery.map(photo => <div className="group relative overflow-hidden bg-white shadow-sm" key={photo.id}><img src={photo.image_url} alt={photo.caption || 'Foto da galeria'} className="h-56 w-full object-cover" /><div className="p-4"><p className="truncate text-sm text-olive">{photo.caption || 'Sem legenda'}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-stone-400">Ordem {photo.sort_order}</p><div className="mt-3 flex gap-4 text-xs"><button onClick={() => openGallery(photo)}>Editar</button><button className="text-red-600" onClick={() => remove('gallery', photo.id)}>Excluir</button></div></div></div>)}</div>
      </>}
      {tab === 'settings' && <form onSubmit={saveSettings} className="max-w-2xl bg-white p-7">{Object.entries(settings).filter(([key]) => labels[key]).map(([key, value]) => <label className="label mb-5 block" key={key}>{labels[key]}{key === 'story_intro' ? <textarea rows="4" className="field" value={value || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} /> : <input className="field" value={value || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} />}</label>)}<button className="btn"><Settings className="mr-2 inline" size={16} />Salvar informações</button></form>}
    </div>
  </div>
}
