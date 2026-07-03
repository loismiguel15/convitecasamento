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
  const [settings, setSettings] = useState({})
  const [error, setError] = useState('')
  const headers = { Authorization: `Bearer ${token}` }

  const logout = () => { sessionStorage.removeItem('adminToken'); setToken(''); setError('') }
  const load = async () => {
    try {
      const [r, m, g, s] = await Promise.all([api('/rsvp', { headers }), api('/messages'), api('/gifts'), api('/settings')])
      setRows(r); setMessages(m); setGifts(g); setSettings(s); setError('')
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
  const saveGift = async (gift, isNew) => {
    const name = prompt('Nome do presente', gift?.name || ''); if (!name) return
    const price = prompt('Valor', gift?.price || ''); if (!price) return
    const image_url = prompt('URL da imagem', gift?.image_url || '')
    await api('/gifts' + (isNew ? '' : `/${gift.id}`), { method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify({ name, price, image_url }) })
    load()
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
        {[['rsvp', 'Confirmações'], ['messages', 'Mensagens'], ['gifts', 'Presentes'], ['settings', 'Informações']].map(x =>
          <button onClick={() => setTab(x[0])} className={`rounded-full px-4 py-2 text-xs ${tab === x[0] ? 'bg-olive text-white' : 'bg-white'}`} key={x[0]}>{x[1]}</button>)}
        <a className="ml-auto flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs text-white" href={`/api/export-rsvp?token=${encodeURIComponent(token)}`}><Download size={15} />Exportar CSV</a>
      </nav>
      {tab === 'rsvp' && <div className="overflow-auto bg-white"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-sand/60"><tr>{['Nome', 'WhatsApp', 'Presença', 'Acompanhantes', 'Nomes', 'Mensagem', 'Data', ''].map(x => <th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r => <tr className="border-t" key={r.id}><td className="p-4 font-semibold">{r.name}</td><td>{r.phone}</td><td>{r.attending === 'yes' ? 'Sim' : 'Não'}</td><td>{r.companions}</td><td>{r.companion_names}</td><td>{r.message}</td><td>{new Date(r.created_at + 'Z').toLocaleDateString('pt-BR')}</td><td><button className="text-red-600" onClick={() => remove('rsvp', r.id)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>}
      {tab === 'messages' && <div className="grid gap-3 sm:grid-cols-2">{messages.map(m => <div className="relative bg-white p-6" key={m.id}><b>{m.name}</b><p className="mt-2 text-sm">{m.message}</p><button onClick={() => remove('messages', m.id)} className="absolute right-4 top-4 text-red-600"><Trash2 size={17} /></button></div>)}</div>}
      {tab === 'gifts' && <><button onClick={() => saveGift(null, true)} className="btn mb-4">Cadastrar presente</button><div className="grid gap-3 sm:grid-cols-3">{gifts.map(g => <div className="bg-white p-5" key={g.id}><Gift className="text-gold" /><b className="mt-3 block">{g.name}</b><p>{Number(g.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><div className="mt-4 flex gap-3"><button onClick={() => saveGift(g)}>Editar</button><button className="text-red-600" onClick={() => remove('gifts', g.id)}>Excluir</button></div></div>)}</div></>}
      {tab === 'settings' && <form onSubmit={saveSettings} className="max-w-2xl bg-white p-7">{Object.entries(settings).filter(([key]) => labels[key]).map(([key, value]) => <label className="label mb-5 block" key={key}>{labels[key]}{key === 'story_intro' ? <textarea rows="4" className="field" value={value || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} /> : <input className="field" value={value || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} />}</label>)}<button className="btn"><Settings className="mr-2 inline" size={16} />Salvar informações</button></form>}
    </div>
  </div>
}
