import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada. Informe a connection string do Supabase PostgreSQL.')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const settingsDefaults = {
  groom: 'Loís Miguel de Lima',
  bride: 'Giovanna Aparecida Leão Costa',
  wedding_date: '18/12/2027',
  wedding_time: '16:00',
  venue: 'Igreja Matriz',
  map_url: 'https://maps.app.goo.gl/HyNrDxHXpMnfpaBaA',
  pix_key: '35999267340',
  whatsapp: '5535999267340',
  instagram: '',
  music_url: '',
  story_intro: 'Nossa história foi escrita com afeto, fé e a beleza das pequenas escolhas diárias. Agora queremos viver esta nova página ao lado de quem torna nossa caminhada especial.'
}

const seedMessages = [
  ['Família Lima', 'Que esta nova caminhada seja repleta de cumplicidade, fé e muitos sorrisos!'],
  ['Mariana & Rafael', 'Estamos contando os dias para celebrar este amor tão bonito com vocês.']
]

const seedGifts = [
  ['Air Fryer', 499.9, 'https://images.unsplash.com/photo-1648621507616-28eae25d1c57?auto=format&fit=crop&w=800&q=80'],
  ['Jogo de Panelas', 649.9, 'https://images.unsplash.com/photo-1584990347449-a132f2d85f0f?auto=format&fit=crop&w=800&q=80'],
  ['Jogo de Cama', 299.9, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'],
  ['Conjunto de Taças', 229.9, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'],
  ['Ajuda para Lua de Mel', 800, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80']
]

const seedGallery = [
  '1519741497674-611481863552',
  '1519225421980-715cb0215aed',
  '1464366400600-7168b8af9bc3',
  '1511285560929-80b456fea0bc',
  '1523438885200-e635ba2c371e',
  '1544078751-58fee2d8a03b'
]

export async function initDb() {
  const client = await pool.connect()

  try {
    await client.query('SELECT NOW()')

    await client.query(`
      CREATE TABLE IF NOT EXISTS confirmations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        attending TEXT NOT NULL,
        guests INTEGER DEFAULT 0,
        companions INTEGER DEFAULT 0,
        companion_names TEXT,
        notes TEXT,
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gifts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        image TEXT,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        caption TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wedding_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    await client.query('ALTER TABLE confirmations ADD COLUMN IF NOT EXISTS guests INTEGER DEFAULT 0')
    await client.query('ALTER TABLE confirmations ADD COLUMN IF NOT EXISTS companions INTEGER DEFAULT 0')
    await client.query('ALTER TABLE confirmations ADD COLUMN IF NOT EXISTS companion_names TEXT')
    await client.query('ALTER TABLE confirmations ADD COLUMN IF NOT EXISTS notes TEXT')
    await client.query('ALTER TABLE gifts ADD COLUMN IF NOT EXISTS description TEXT')
    await client.query('ALTER TABLE gifts ADD COLUMN IF NOT EXISTS image TEXT')
    await client.query('ALTER TABLE gifts ADD COLUMN IF NOT EXISTS image_url TEXT')

    for (const [key, value] of Object.entries(settingsDefaults)) {
      await client.query(
        'INSERT INTO wedding_settings(key,value) VALUES($1,$2) ON CONFLICT (key) DO NOTHING',
        [key, value]
      )
    }

    const messagesCount = await client.query('SELECT COUNT(*)::int AS count FROM messages')
    if (!messagesCount.rows[0].count) {
      for (const message of seedMessages) {
        await client.query('INSERT INTO messages(name,message) VALUES($1,$2)', message)
      }
    }

    const giftsCount = await client.query('SELECT COUNT(*)::int AS count FROM gifts')
    if (!giftsCount.rows[0].count) {
      for (const [name, price, imageUrl] of seedGifts) {
        await client.query(
          'INSERT INTO gifts(name,price,image,image_url) VALUES($1,$2,$3,$3)',
          [name, price, imageUrl]
        )
      }
    }

    const galleryCount = await client.query('SELECT COUNT(*)::int AS count FROM gallery')
    if (!galleryCount.rows[0].count) {
      for (const [index, id] of seedGallery.entries()) {
        await client.query(
          'INSERT INTO gallery(image_url,caption,sort_order) VALUES($1,$2,$3)',
          [`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=85`, 'Inspiração romântica', index]
        )
      }
    }

    console.log('Banco Supabase conectado com sucesso')
  } finally {
    client.release()
  }
}

export default pool
