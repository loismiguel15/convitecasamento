import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, X } from 'lucide-react'

const tlv = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`
const crc16 = value => {
  let crc = 0xffff
  for (let i = 0; i < value.length; i++) {
    crc ^= value.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1
    crc &= 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}
const pixPayload = (key, amount, description) => {
  const merchant = tlv('00', 'BR.GOV.BCB.PIX') + tlv('01', key) + tlv('02', String(description || 'Presente de casamento').slice(0, 40))
  const name = 'LOIS E GIOVANNA', city = 'BRASIL'
  let payload = tlv('00', '01') + tlv('26', merchant) + tlv('52', '0000') + tlv('53', '986')
  if (Number(amount) > 0) payload += tlv('54', Number(amount).toFixed(2))
  payload += tlv('58', 'BR') + tlv('59', name) + tlv('60', city) + tlv('62', tlv('05', 'CASAMENTO')) + '6304'
  return payload + crc16(payload)
}

export default function PixModal({ gift, pixKey, onClose }) {
  const [copied, setCopied] = useState(false)
  if (!gift) return null
  const payload = pixPayload(pixKey, gift.price, gift.name)
  const copy = async value => {
    await navigator.clipboard.writeText(value)
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }
  return <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-olive/85 p-5 backdrop-blur-sm" onClick={onClose}>
    <div className="relative w-full max-w-md bg-white p-7 text-center shadow-2xl sm:p-9" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute right-4 top-4 text-stone-500" aria-label="Fechar"><X /></button>
      <p className="text-[10px] uppercase tracking-[.3em] text-gold">Presente escolhido</p>
      <h3 className="mt-2 font-display text-4xl text-olive">{gift.name}</h3>
      <p className="mb-5 mt-1 font-semibold text-gold">{Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      <div className="mx-auto w-fit border border-gold/20 bg-white p-3"><QRCodeSVG value={payload} size={190} level="M" fgColor="#263426" /></div>
      <p className="my-4 text-xs leading-5 text-stone-500">Escaneie com o aplicativo do seu banco ou copie o código PIX abaixo.</p>
      <button onClick={() => copy(payload)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cream px-4 py-3 text-xs font-semibold text-olive">
        {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Código copiado!' : 'Copiar PIX copia e cola'}
      </button>
      <button onClick={() => copy(pixKey)} className="mt-3 text-[10px] uppercase tracking-widest text-stone-500">Chave: {pixKey}</button>
      <a className="btn mt-5 block" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Olá! Enviei um presente para Loís e Giovanna: ${gift.name}.`)}`}>Avisar os noivos</a>
    </div>
  </div>
}
