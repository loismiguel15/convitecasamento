import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import multer from 'multer'
import pool, { initDb } from './db.js'
import { existsSync, readFileSync, mkdirSync } from 'fs'
import { resolve, join, extname } from 'path'
import { tmpdir } from 'os'

const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const SESSION_SECRET = process.env.SESSION_SECRET || `${ADMIN_PASSWORD}-lois-giovanna`
const uploadsDir = process.env.UPLOAD_DIR || join(tmpdir(), 'convite-casamento-uploads')

app.use(cors())
app.use(express.json({ limit: '200kb' }))

mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

const allowedImages = new Set(['image/jpeg', 'image/png', 'image/webp'])
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, done) => done(null, `${crypto.randomUUID()}${extname(file.originalname).toLowerCase() || '.jpg'}`)
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, done) => allowedImages.has(file.mimetype) ? done(null, true) : done(new Error('Formato de imagem não permitido.'))
})

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const cleanPhone = value => String(value || '').replace(/\D/g, '')
const sign = value => crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url')
const dateColumn = "to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS') AS created_at"

const createToken = () => {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

const validToken = token => {
  try {
    const [payload, signature] = String(token || '').split('.')
    if (!payload || !signature || sign(payload) !== signature) return false
    return JSON.parse(Buffer.from(payload, 'base64url')).exp > Date.now()
  } catch {
    return false
  }
}

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query.token
  return validToken(token) ? next() : res.status(401).json({ error: 'Sessão administrativa inválida ou expirada.' })
}

app.post('/api/admin/login', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Senha administrativa inválida.' })
  res.json({ token: createToken(), expires_in: 28800 })
})

app.post('/api/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Selecione uma imagem.' })
  res.status(201).json({ url: `/uploads/${req.file.filename}` })
})

app.post('/api/rsvp', asyncRoute(async (req, res) => {
  let { name, phone, attending, companions = 0, companion_names = '', notes = '', message = '' } = req.body
  phone = cleanPhone(phone)
  companions = Math.min(10, Math.max(0, Number(companions) || 0))

  if (!name?.trim() || phone.length < 10 || !['yes', 'no'].includes(attending)) {
    return res.status(400).json({ error: 'Informe nome, telefone válido e presença.' })
  }

  const current = await pool.query('SELECT id FROM confirmations WHERE phone=$1 ORDER BY id DESC LIMIT 1', [phone])

  if (current.rows[0]) {
    await pool.query(
      `UPDATE confirmations
       SET name=$1, attending=$2, guests=$3, companions=$3, companion_names=$4, notes=$5, message=$6, created_at=NOW()
       WHERE id=$7`,
      [name.trim(), attending, companions, companion_names.trim(), notes.trim(), message.trim(), current.rows[0].id]
    )
    return res.json({ id: current.rows[0].id, updated: true })
  }

  const result = await pool.query(
    `INSERT INTO confirmations(name,phone,attending,guests,companions,companion_names,notes,message)
     VALUES($1,$2,$3,$4,$4,$5,$6,$7)
     RETURNING id`,
    [name.trim(), phone, attending, companions, companion_names.trim(), notes.trim(), message.trim()]
  )
  res.status(201).json({ id: result.rows[0].id, updated: false })
}))

app.get('/api/rsvp', auth, asyncRoute(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT id,name,phone,attending,guests,companions,companion_names,notes,message,${dateColumn}
    FROM confirmations
    ORDER BY created_at DESC
  `)
  res.json(rows)
}))

app.delete('/api/rsvp/:id', auth, asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM confirmations WHERE id=$1', [req.params.id])
  res.status(204).end()
}))

app.post('/api/messages', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim()
  const message = String(req.body.message || '').trim()
  if (!name || !message || name.length > 80 || message.length > 600) {
    return res.status(400).json({ error: 'Revise o nome e a mensagem.' })
  }
  const result = await pool.query('INSERT INTO messages(name,message) VALUES($1,$2) RETURNING id', [name, message])
  res.status(201).json({ id: result.rows[0].id })
}))

app.get('/api/messages', asyncRoute(async (req, res) => {
  const { rows } = await pool.query(`SELECT id,name,message,${dateColumn} FROM messages ORDER BY created_at DESC LIMIT 50`)
  res.json(rows)
}))

app.delete('/api/messages/:id', auth, asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id=$1', [req.params.id])
  res.status(204).end()
}))

app.get('/api/gifts', asyncRoute(async (req, res) => {
  const { rows } = await pool.query(`SELECT id,name,description,price,COALESCE(image_url,image,'') AS image_url,${dateColumn} FROM gifts ORDER BY id`)
  res.json(rows)
}))

app.post('/api/gifts', auth, asyncRoute(async (req, res) => {
  if (!req.body.name || Number(req.body.price) <= 0) return res.status(400).json({ error: 'Nome e valor são obrigatórios.' })
  const imageUrl = req.body.image_url || req.body.image || ''
  const result = await pool.query(
    'INSERT INTO gifts(name,description,price,image,image_url) VALUES($1,$2,$3,$4,$4) RETURNING id',
    [req.body.name, req.body.description || '', Number(req.body.price), imageUrl]
  )
  res.status(201).json({ id: result.rows[0].id })
}))

app.put('/api/gifts/:id', auth, asyncRoute(async (req, res) => {
  const imageUrl = req.body.image_url || req.body.image || ''
  await pool.query(
    'UPDATE gifts SET name=$1, description=$2, price=$3, image=$4, image_url=$4 WHERE id=$5',
    [req.body.name, req.body.description || '', Number(req.body.price), imageUrl, req.params.id]
  )
  res.json({ ok: true })
}))

app.delete('/api/gifts/:id', auth, asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM gifts WHERE id=$1', [req.params.id])
  res.status(204).end()
}))

app.get('/api/gallery', asyncRoute(async (req, res) => {
  const { rows } = await pool.query(`SELECT id,image_url,caption,sort_order,${dateColumn} FROM gallery ORDER BY sort_order,id`)
  res.json(rows)
}))

app.post('/api/gallery', auth, asyncRoute(async (req, res) => {
  if (!req.body.image_url) return res.status(400).json({ error: 'Selecione uma imagem.' })
  const result = await pool.query(
    'INSERT INTO gallery(image_url,caption,sort_order) VALUES($1,$2,$3) RETURNING id',
    [req.body.image_url, req.body.caption || '', Number(req.body.sort_order) || 0]
  )
  res.status(201).json({ id: result.rows[0].id })
}))

app.put('/api/gallery/:id', auth, asyncRoute(async (req, res) => {
  await pool.query(
    'UPDATE gallery SET image_url=$1, caption=$2, sort_order=$3 WHERE id=$4',
    [req.body.image_url, req.body.caption || '', Number(req.body.sort_order) || 0, req.params.id]
  )
  res.json({ ok: true })
}))

app.delete('/api/gallery/:id', auth, asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM gallery WHERE id=$1', [req.params.id])
  res.status(204).end()
}))

app.get('/api/settings', asyncRoute(async (req, res) => {
  const { rows } = await pool.query('SELECT key,value FROM wedding_settings ORDER BY id')
  res.json(Object.fromEntries(rows.map(row => [row.key, row.value])))
}))

app.put('/api/settings', auth, asyncRoute(async (req, res) => {
  const keys = ['groom', 'bride', 'wedding_date', 'wedding_time', 'venue', 'map_url', 'pix_key', 'whatsapp', 'instagram', 'music_url', 'story_intro']
  for (const key of keys) {
    await pool.query(
      `INSERT INTO wedding_settings(key,value,updated_at)
       VALUES($1,$2,NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [key, String(req.body[key] ?? '')]
    )
  }
  res.json({ ok: true })
}))

app.get('/api/export-rsvp', auth, asyncRoute(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT id,name,phone,attending,guests,companions,companion_names,notes,message,${dateColumn}
    FROM confirmations
    ORDER BY created_at
  `)
  const columns = ['name', 'phone', 'attending', 'companions', 'companion_names', 'notes', 'message', 'created_at']
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`
  res.type('text/csv').attachment('confirmacoes.csv')
    .send('\uFEFF' + columns.join(';') + '\n' + rows.map(row => columns.map(column => escape(row[column])).join(';')).join('\n'))
}))

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

app.use((error, req, res, next) => {
  console.error(error)
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'A imagem deve ter no máximo 8 MB.' })
  if (error) return res.status(400).json({ error: error.message || 'Não foi possível processar a solicitação.' })
  next()
})

initDb()
  .then(() => app.listen(PORT, () => console.log(`API em http://localhost:${PORT}`)))
  .catch(error => {
    console.error('Erro ao conectar no Supabase:', error.message)
    process.exit(1)
  })
