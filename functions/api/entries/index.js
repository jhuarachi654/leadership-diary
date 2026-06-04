// GET  /api/entries  — public, returns all entries newest first
// POST /api/entries  — authenticated, creates a new entry

const CREDENTIALS = 'jhuarachi654@gmail.com:Brocky123!'

function isAuthenticated(request) {
  const auth = request.headers.get('Authorization') ?? ''
  if (!auth.startsWith('Basic ')) return false
  try {
    return atob(auth.slice(6)) === CREDENTIALS
  } catch {
    return false
  }
}

function rowToEntry(row) {
  if (row.entry_type === 'photo') {
    return {
      id: row.id,
      type: 'photo',
      weekIndex: row.week_index,
      image: row.image,
      caption: row.caption,
      date: row.date,
      timestamp: row.timestamp,
    }
  }
  return {
    id: row.id,
    entryType: row.entry_type,
    weekIndex: row.week_index,
    title: row.title,
    content: row.content,
    date: row.date,
    timestamp: row.timestamp,
  }
}

export async function onRequestGet({ env }) {
  const { results } = await env.leadership_diary.prepare(
    'SELECT * FROM entries ORDER BY timestamp DESC'
  ).all()

  return Response.json(results.map(rowToEntry))
}

export async function onRequestPost({ request, env }) {
  if (!isAuthenticated(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { entryType, weekIndex, title, content, image, caption, date, timestamp } = body

  if (!entryType || weekIndex === undefined || !date || !timestamp) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isPhoto = entryType === 'photo'
  if (!isPhoto && (!title?.trim() || !content?.trim())) {
    return Response.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const id = crypto.randomUUID()

  await env.leadership_diary.prepare(
    `INSERT INTO entries (id, week_index, entry_type, title, content, image, caption, date, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, weekIndex, entryType, title ?? null, content ?? null, image ?? null, caption ?? null, date, timestamp).run()

  const row = await env.leadership_diary.prepare(
    'SELECT * FROM entries WHERE id = ?'
  ).bind(id).first()

  return Response.json(rowToEntry(row), { status: 201 })
}
