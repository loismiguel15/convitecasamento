import { useEffect, useRef, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, Clock3, MapPin, Heart, X, Gift, Music2, Pause, Quote, BedDouble, Car, Timer, Shirt, Instagram, MessageCircle, Share2 } from 'lucide-react'
import { W } from './config'
import { api } from './api'
import Nav from './components/Nav'
import Opening from './components/Opening'
import Countdown from './components/Countdown'
import PixModal from './components/PixModal'
import { Heading, Reveal } from './components/UI'
import Admin from './pages/Admin'

const photos = ['photo-1519741497674-611481863552', 'photo-1519225421980-715cb0215aed', 'photo-1464366400600-7168b8af9bc3', 'photo-1511285560929-80b456fea0bc', 'photo-1523438885200-e635ba2c371e', 'photo-1544078751-58fee2d8a03b']
const initialRsvp = { name: '', phone: '', attending: 'yes', companions: 0, companion_names: '', notes: '', message: '' }

function Invitation() {
  const [opening, setOpening] = useState(!sessionStorage.opened)
  const [playing, setPlaying] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [selectedGift, setSelectedGift] = useState(null)
  const [gifts, setGifts] = useState([])
  const [messages, setMessages] = useState([])
  const [settings, setSettings] = useState(null)
  const [rsvp, setRsvp] = useState(initialRsvp)
  const [message, setMessage] = useState({ name: '', message: '' })
  const [notice, setNotice] = useState('')
  const audio = useRef()

  const dateIso = settings?.wedding_date?.split('/').reverse().join('-')
  const dateLong = dateIso ? new Date(`${dateIso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '18 de dezembro de 2027'
  const S = settings ? {
    ...W,
    groom: settings.groom || W.groom,
    bride: (settings.bride || W.bride).replace(/\s+Costa$/i, ''),
    date: dateIso ? `${dateIso}T${settings.wedding_time || '16:00'}:00-03:00` : W.date,
    dateLong,
    time: settings.wedding_time || '16:00',
    venue: settings.venue || 'Igreja Matriz',
    map: settings.map_url || W.map,
    pix: settings.pix_key || W.pix,
    whatsapp: settings.whatsapp || '5535999267340',
    instagram: settings.instagram || '',
    music: settings.music_url || '',
    story: settings.story_intro || ''
  } : { ...W, dateLong, time: '16:00', venue: 'Igreja Matriz', whatsapp: '5535999267340', instagram: '', story: '' }

  const load = () => {
    api('/gifts').then(setGifts).catch(() => {})
    api('/messages').then(setMessages).catch(() => {})
    api('/settings').then(setSettings).catch(() => {})
  }
  useEffect(load, [])

  const sendRsvp = async e => {
    e.preventDefault()
    try {
      const result = await api('/rsvp', { method: 'POST', body: JSON.stringify(rsvp) })
      setNotice(result.updated ? 'Sua confirmação anterior foi atualizada com sucesso.' : 'Presença registrada com carinho. Obrigado!')
      setRsvp(initialRsvp)
    } catch (error) { setNotice(error.message) }
  }
  const sendMessage = async e => {
    e.preventDefault()
    try {
      await api('/messages', { method: 'POST', body: JSON.stringify(message) })
      setMessage({ name: '', message: '' }); load()
    } catch (error) { alert(error.message) }
  }
  const toggleMusic = () => {
    if (!S.music) return alert('A música ainda não foi configurada no painel.')
    if (playing) audio.current.pause()
    else audio.current.play().catch(() => alert('Adicione um arquivo de música válido no painel.'))
    setPlaying(!playing)
  }
  const share = async () => {
    const data = { title: `${S.groom} & ${S.bride}`, text: `Você está convidado para o nosso casamento em ${S.dateLong}!`, url: location.href }
    if (navigator.share) await navigator.share(data)
    else { await navigator.clipboard.writeText(location.href); alert('Link do convite copiado!') }
  }

  return <>
    <Opening show={opening} onOpen={() => { sessionStorage.opened = '1'; setOpening(false) }} />
    <Nav />
    <main>
      <section id="inicio" className="relative flex min-h-[100svh] items-start justify-center overflow-hidden bg-olive px-5 pb-14 pt-28 text-center text-white sm:items-center sm:py-28">
        <img src="/images/hero-wedding.png" className="absolute inset-0 h-full w-full object-cover" alt="Flores brancas e alianças na igreja" />
        <div className="absolute inset-0 bg-gradient-to-b from-olive/55 via-olive/45 to-olive/85" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative w-full max-w-5xl">
          <p className="mb-4 text-[9px] uppercase tracking-[.45em] text-sand sm:mb-6 sm:text-[10px]">Vamos nos casar</p>
          <h1 className="break-words font-display text-5xl leading-[.9] sm:text-6xl md:text-9xl">{S.groom}<i className="my-2 block text-3xl text-gold sm:my-4 sm:text-4xl">&</i>{S.bride}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-white/85 sm:mt-8 sm:leading-7">Com muita alegria, convidamos você para celebrar conosco este momento tão especial.</p>
          <div className="mx-auto my-6 grid max-w-2xl overflow-hidden rounded-2xl border border-white/25 bg-olive/55 shadow-2xl backdrop-blur-md sm:my-8 sm:grid-cols-3 sm:divide-x sm:divide-white/20">
            {[[CalendarDays, 'Data', S.dateLong], [Clock3, 'Horário', S.time], [MapPin, 'Local', S.venue]].map(([Icon, label, value]) =>
              <div className="flex items-center justify-center gap-3 border-b border-white/20 px-4 py-3 last:border-0 sm:border-b-0 sm:px-5 sm:py-4" key={label}><Icon className="shrink-0 text-gold" size={22} /><span className="text-left"><small className="block text-[8px] uppercase tracking-[.25em] text-white/60">{label}</small><strong className="mt-1 block text-xs uppercase tracking-wider text-white">{value}</strong></span></div>)}
          </div>
          <div className="mx-auto flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <a href="#rsvp" className="btn bg-gold">Confirmar presença</a>
            <a href={S.map} target="_blank" rel="noreferrer" className="rounded-full border border-white/60 px-7 py-3 text-xs uppercase tracking-widest">Ver localização</a>
            <button onClick={share} className="mx-auto flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/75 sm:mx-0 sm:px-3"><Share2 size={15} />Compartilhar</button>
          </div>
        </motion.div>
      </section>

      <Countdown date={S.date} />

      <section id="historia" className="bg-cream px-5 py-24"><div className="mx-auto max-w-5xl">
        <Heading eyebrow="Do encontro ao altar">Nossa história</Heading>
        <p className="mx-auto mb-14 max-w-2xl text-center text-sm leading-7 text-stone-600">{S.story || 'Nossa história foi escrita com afeto, fé e a beleza das pequenas escolhas diárias. Agora queremos viver esta nova página ao lado de quem torna nossa caminhada especial.'}</p>
        <div className="grid gap-5 md:grid-cols-4">{[['Como nos conhecemos', 'Um encontro que parecia comum ganhou o contorno de destino.'], ['Pedido de namoro', 'O carinho transbordou e dois caminhos viraram uma só história.'], ['Pedido de casamento', 'Com o coração acelerado, dissemos sim ao próximo capítulo.'], ['O grande dia', `${S.dateLong}: diante de Deus e de quem amamos.`]].map((item, index) =>
          <Reveal className="card p-7" key={item[0]}><b className="text-xs text-gold">0{index + 1}</b><h3 className="my-3 font-display text-3xl text-olive">{item[0]}</h3><p className="text-sm leading-6 text-stone-500">{item[1]}</p></Reveal>)}</div>
      </div></section>

      <section className="px-5 py-24"><div className="mx-auto max-w-5xl">
        <Heading eyebrow="Com a bênção de nossas famílias">Nossos pais</Heading>
        <div className="grid gap-5 md:grid-cols-2">{[[S.groom, W.groomParents], [S.bride, W.brideParents]].map(item =>
          <Reveal className="border border-gold/30 p-10 text-center shadow-soft" key={item[0]}><Heart className="mx-auto text-gold" /><h3 className="my-4 font-display text-4xl text-olive">{item[0]}</h3><p className="text-sm leading-7 text-stone-500">{item[1]}</p></Reveal>)}</div>
      </div></section>

      <section id="cerimonia" className="bg-olive px-5 py-24"><div className="mx-auto max-w-5xl">
        <Heading light eyebrow="Onde diremos sim">Cerimônia</Heading>
        <div className="grid overflow-hidden bg-white/5 text-white shadow-2xl ring-1 ring-white/15 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col justify-center p-8 sm:p-9 lg:p-14"><MapPin className="text-gold" /><h3 className="my-5 font-display text-4xl">{S.venue}</h3><p className="mb-2 flex items-center gap-3 text-white/80"><CalendarDays className="shrink-0 text-gold" size={18} />{S.dateLong}</p><p className="mb-8 flex items-center gap-3 text-white/80"><Clock3 className="shrink-0 text-gold" size={18} />{S.time}</p><a className="btn w-fit bg-gold" href={S.map} target="_blank" rel="noreferrer">Ver localização</a></div>
          <figure className="relative min-h-[430px] overflow-hidden sm:min-h-[520px] lg:min-h-[580px]"><img src="/images/igreja-matriz-editada.png" alt={`Fachada da ${S.venue}`} className="absolute inset-0 h-full w-full object-cover object-[center_55%] transition duration-700 hover:scale-[1.03]" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-olive/80 to-transparent px-6 pb-5 pt-16"><figcaption className="text-[10px] uppercase tracking-[.25em] text-white/80">{S.venue} · Nosso altar</figcaption></div></figure>
        </div>
      </div></section>

      <section id="galeria" className="bg-cream px-5 py-24"><div className="mx-auto max-w-6xl">
        <Heading eyebrow="Memórias que guardamos">Galeria</Heading>
        <div className="columns-2 gap-3 md:columns-3">{photos.map((photo, index) => { const src = `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=85`; return <button className="mb-3 block w-full overflow-hidden" onClick={() => setLightbox(src)} key={photo}><img loading="lazy" className={`w-full object-cover transition hover:scale-105 ${index % 3 === 1 ? 'h-80' : 'h-56 md:h-72'}`} src={src} alt="Inspiração romântica" /></button> })}</div>
        <p className="mt-8 text-center text-xs text-stone-400">As fotos podem ser substituídas por momentos reais do casal em <code>frontend/public/images</code>.</p>
      </div></section>
      {lightbox && <div onClick={() => setLightbox(null)} className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-6"><button className="absolute right-6 top-6 text-white"><X /></button><img className="max-h-[90vh]" src={lightbox} alt="Foto ampliada" /></div>}

      <section id="presentes" className="px-5 py-24"><div className="mx-auto max-w-6xl">
        <Heading eyebrow="Seu carinho é o melhor presente">Lista de presentes</Heading>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm leading-7 text-stone-500">Sua presença é o mais importante. Se desejar nos presentear, escolha uma lembrança e utilize o QR Code PIX.</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map(gift =>
            <Reveal className="card overflow-hidden" key={gift.id}><img loading="lazy" className="h-52 w-full object-cover" src={gift.image_url} alt={gift.name} /><div className="p-6"><Gift className="text-gold" /><h3 className="mt-3 font-display text-2xl text-olive">{gift.name}</h3><p className="my-4 text-sm text-gold">{Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><button onClick={() => setSelectedGift(gift)} className="btn w-full">Presentear</button></div></Reveal>)}
          <Reveal className="card overflow-hidden">
            <div className="relative flex h-52 items-center justify-center overflow-hidden bg-olive">
              <img src="/images/hero-wedding.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-br from-olive/30 to-olive/90" />
              <div className="relative grid h-20 w-20 place-items-center rounded-full border border-gold/50 bg-olive/70 text-gold backdrop-blur"><Heart size={32} /></div>
            </div>
            <div className="p-6"><Gift className="text-gold" /><h3 className="mt-3 font-display text-2xl text-olive">Presente livre</h3><p className="my-4 text-sm text-gold">Você escolhe o valor</p><button onClick={() => setSelectedGift({ name: 'Presente livre', price: 0, custom: true })} className="btn w-full">Doar qualquer valor</button></div>
          </Reveal>
        </div>
      </div></section>
      <PixModal gift={selectedGift} pixKey={S.pix} onClose={() => setSelectedGift(null)} />

      <section id="rsvp" className="bg-olive px-5 py-24"><div className="mx-auto max-w-4xl">
        <Heading light eyebrow="Reserve este encontro">Confirme sua presença</Heading>
        <p className="mx-auto mb-8 max-w-xl text-center text-xs leading-6 text-white/60">Já respondeu? Envie novamente usando o mesmo telefone para atualizar sua confirmação.</p>
        <form onSubmit={sendRsvp} className="grid gap-7 bg-white p-8 md:grid-cols-2 md:p-12">
          {[['name', 'Nome completo *'], ['phone', 'Telefone / WhatsApp *'], ['companion_names', 'Nomes dos acompanhantes'], ['notes', 'Observação']].map(field => <label className="label" key={field[0]}>{field[1]}<input required={['name', 'phone'].includes(field[0])} className="field" value={rsvp[field[0]]} onChange={e => setRsvp({ ...rsvp, [field[0]]: e.target.value })} /></label>)}
          <label className="label">Vai comparecer?<select className="field" value={rsvp.attending} onChange={e => setRsvp({ ...rsvp, attending: e.target.value })}><option value="yes">Sim</option><option value="no">Não</option></select></label>
          <label className="label">Acompanhantes<input type="number" min="0" max="10" className="field" value={rsvp.companions} onChange={e => setRsvp({ ...rsvp, companions: e.target.value })} /></label>
          <label className="label md:col-span-2">Mensagem para os noivos<textarea maxLength="600" className="field" value={rsvp.message} onChange={e => setRsvp({ ...rsvp, message: e.target.value })} /></label>
          <div className="text-center md:col-span-2"><button className="btn">Confirmar presença</button>{notice && <p className={`mt-4 text-sm ${notice.includes('sucesso') || notice.includes('registrada') ? 'text-green-700' : 'text-stone-600'}`}>{notice}</p>}</div>
        </form>
      </div></section>

      <section id="recados" className="px-5 py-24"><div className="mx-auto max-w-6xl">
        <Heading eyebrow="Palavras que ficam">Mural de recados</Heading>
        <div className="grid gap-8 lg:grid-cols-3">
          <form onSubmit={sendMessage} className="bg-cream p-8"><h3 className="font-display text-3xl text-olive">Deixe seu carinho</h3><input maxLength="80" required placeholder="Seu nome" className="field my-5" value={message.name} onChange={e => setMessage({ ...message, name: e.target.value })} /><textarea maxLength="600" required placeholder="Sua mensagem" className="field mb-6" rows="5" value={message.message} onChange={e => setMessage({ ...message, message: e.target.value })} /><button className="btn">Enviar recado</button></form>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">{messages.map(item => <div className="border border-gold/20 p-6" key={item.id}><Quote className="text-gold" /><p className="my-4 text-sm italic leading-6">“{item.message}”</p><b className="text-[10px] uppercase tracking-widest text-olive">{item.name}</b></div>)}</div>
        </div>
      </div></section>

      <section id="dicas" className="bg-cream px-5 py-24"><div className="mx-auto max-w-6xl"><Heading eyebrow="Para aproveitar cada instante">Dicas aos convidados</Heading><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[[BedDouble, 'Hospedagem', 'Prefira opções próximas ao centro.'], [Car, 'Estacionamento', 'Há estacionamentos na região da igreja.'], [Timer, 'Chegue com calma', 'Recomendamos chegar às 15:30.'], [Shirt, 'Traje sugerido', 'Esporte fino; evite branco e marfim.']].map(([Icon, title, text]) => <div className="card p-7" key={title}><Icon className="text-gold" /><h3 className="my-4 font-display text-2xl text-olive">{title}</h3><p className="text-sm leading-6 text-stone-500">{text}</p></div>)}</div></div></section>
    </main>

    <footer className="bg-olive px-5 py-14 text-center text-white">
      <p className="font-display text-3xl italic">Com carinho, {S.groom} <b className="text-gold">&</b> {S.bride}</p>
      <p className="mt-3 text-xs text-white/50">2027</p>
      <div className="mt-5 flex justify-center gap-5 text-gold">
        {S.whatsapp && <a aria-label="WhatsApp" target="_blank" rel="noreferrer" href={`https://wa.me/${S.whatsapp.replace(/\D/g, '')}`}><MessageCircle /></a>}
        {S.instagram && <a aria-label="Instagram" target="_blank" rel="noreferrer" href={S.instagram}><Instagram /></a>}
        <a aria-label="Localização" target="_blank" rel="noreferrer" href={S.map}><MapPin /></a>
        <button aria-label="Compartilhar convite" onClick={share}><Share2 /></button>
      </div>
    </footer>
    <audio ref={audio} src={S.music} onEnded={() => setPlaying(false)} />
    <button onClick={toggleMusic} title="Tocar ou pausar música" className={`fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-gold text-white shadow-xl ${playing ? 'animate-pulse' : ''}`}>{playing ? <Pause /> : <Music2 />}</button>
  </>
}

export default function App() {
  return <Routes><Route path="/admin" element={<Admin />} /><Route path="*" element={<Invitation />} /></Routes>
}
