import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import db from './db.js'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const SESSION_SECRET = process.env.SESSION_SECRET || `${ADMIN_PASSWORD}-lois-giovanna`

app.use(cors())
app.use(express.json({ limit: '200kb' }))

const cleanPhone = value => String(value || '').replace(/\D/g, '')
const sign = value => crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url')
const createToken = () => {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}
const validToken = token => {
  try {
    const [payload, signature] = String(token || '').split('.')
    if (!payload || !signature || sign(payload) !== signature) return false
    return JSON.parse(Buffer.from(payload, 'base64url')).exp > Date.now()
  } catch { return false }
}
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query.token
  return validToken(token) ? next() : res.status(401).json({ error: 'Sessão administrativa inválida ou expirada.' })
}

app.post('/api/admin/login', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Senha administrativa inválida.' })
  res.json({ token: createToken(), expires_in: 28800 })
})

app.post('/api/rsvp', (req, res) => {
  let { name, phone, attending, companions = 0, companion_names = '', notes = '', message = '' } = req.body
  phone = cleanPhone(phone)
  companions = Math.min(10, Math.max(0, Number(companions) || 0))
  if (!name?.trim() || phone.length < 10 || !['yes', 'no'].includes(attending)) {
    return res.status(400).json({ error: 'Informe nome, telefone válido e presença.' })
  }
  const current = db.prepare('SELECT id FROM confirmations WHERE phone=? ORDER BY id DESC LIMIT 1').get(phone)
  if (current) {
    db.prepare('UPDATE confirmations SET name=?,attending=?,companions=?,companion_names=?,notes=?,message=?,created_at=CURRENT_TIMESTAMP WHERE id=?')
      .run(name.trim(), attending, companions, companion_names.trim(), notes.trim(), message.trim(), current.id)
    return res.json({ id: current.id, updated: true })
  }
  const result = db.prepare('INSERT INTO confirmations(name,phone,attending,companions,companion_names,notes,message) VALUES(?,?,?,?,?,?,?)')
    .run(name.trim(), phone, attending, companions, companion_names.trim(), notes.trim(), message.trim())
  res.status(201).json({ id: result.lastInsertRowid, updated: false })
})
app.get('/api/rsvp', auth, (req, res) => res.json(db.prepare('SELECT * FROM confirmations ORDER BY created_at DESC').all()))
app.delete('/api/rsvp/:id', auth, (req, res) => {
  db.prepare('DELETE FROM confirmations WHERE id=?').run(req.params.id)
  res.status(204).end()
})

app.post('/api/messages', (req, res) => {
  const name = String(req.body.name || '').trim(), message = String(req.body.message || '').trim()
  if (!name || !message || name.length > 80 || message.length > 600) return res.status(400).json({ error: 'Revise o nome e a mensagem.' })
  const result = db.prepare('INSERT INTO messages(name,message) VALUES(?,?)').run(name, message)
  res.status(201).json({ id: result.lastInsertRowid })
})
app.get('/api/messages', (req, res) => res.json(db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50').all()))
app.delete('/api/messages/:id', auth, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id=?').run(req.params.id)
  res.status(204).end()
})

app.get('/api/gifts', (req, res) => res.json(db.prepare('SELECT * FROM gifts ORDER BY id').all()))
app.post('/api/gifts', auth, (req, res) => {
  if (!req.body.name || Number(req.body.price) <= 0) return res.status(400).json({ error: 'Nome e valor são obrigatórios.' })
  const result = db.prepare('INSERT INTO gifts(name,price,image_url) VALUES(?,?,?)').run(req.body.name, Number(req.body.price), req.body.image_url || '')
  res.status(201).json({ id: result.lastInsertRowid })
})
app.put('/api/gifts/:id', auth, (req, res) => {
  db.prepare('UPDATE gifts SET name=?,price=?,image_url=? WHERE id=?').run(req.body.name, Number(req.body.price), req.body.image_url || '', req.params.id)
  res.json({ ok: true })
})
app.delete('/api/gifts/:id', auth, (req, res) => {
  db.prepare('DELETE FROM gifts WHERE id=?').run(req.params.id)
  res.status(204).end()
})

app.get('/api/settings', (req, res) => res.json(db.prepare('SELECT * FROM wedding_settings WHERE id=1').get()))
app.put('/api/settings', auth, (req, res) => {
  const x = req.body
  db.prepare(`UPDATE wedding_settings SET groom=?,bride=?,wedding_date=?,wedding_time=?,venue=?,map_url=?,pix_key=?,whatsapp=?,instagram=?,music_url=?,story_intro=?,updated_at=CURRENT_TIMESTAMP WHERE id=1`)
    .run(x.groom, x.bride, x.wedding_date, x.wedding_time, x.venue, x.map_url, x.pix_key, x.whatsapp || '', x.instagram || '', x.music_url || '', x.story_intro || '')
  res.json({ ok: true })
})

app.get('/api/export-rsvp', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM confirmations ORDER BY created_at').all()
  const columns = ['name', 'phone', 'attending', 'companions', 'companion_names', 'notes', 'message', 'created_at']
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`
  res.type('text/csv').attachment('confirmacoes.csv')
    .send('\uFEFF' + columns.join(';') + '\n' + rows.map(row => columns.map(column => escape(row[column])).join(';')).join('\n'))
})

const dist = resolve('../frontend/dist')
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false }))
  app.get('/{*splat}', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}`
    const html = readFileSync(resolve(dist, 'index.html'), 'utf8')
      .replace('content="/images/hero-wedding.png"', `content="${origin}/images/hero-wedding.png"`)
    res.type('html').send(html)
  })
}
app.listen(PORT, () => console.log(`API em http://localhost:${PORT}`))
