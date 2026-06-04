// PUT    /api/entries/:id  — authenticated, updates an entry
// DELETE /api/entries/:id  — authenticated, deletes an entry

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

export async function onRequestPut({ params, request, env }) {
  if (!isAuthenticated(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  const existing = await env.leadership_diary.prepare(
    'SELECT * FROM entries WHERE id = ?'
  ).bind(id).first()

  if (!existing) {
    return Response.json({ error: 'Entry not found' }, { status: 404 })
  }

  const body = await request.json()

  const entryType = body.entryType  ?? existing.entry_type
  const title     = body.title      !== undefined ? body.title     : existing.title
  const content   = body.content    !== undefined ? body.content   : existing.content
  const caption   = body.caption    !== undefined ? body.caption   : existing.caption
  const image     = body.image      !== undefined ? body.image     : existing.image
  const weekIndex = body.weekIndex  !== undefined ? body.weekIndex : existing.week_index
  const date      = body.date       ?? existing.date
  const timestamp = body.timestamp  ?? existing.timestamp

  await env.leadership_diary.prepare(
    `UPDATE entries
     SET entry_type = ?, title = ?, content = ?, caption = ?, image = ?,
         week_index = ?, date = ?, timestamp = ?
     WHERE id = ?`
  ).bind(entryType, title, content, caption, image, weekIndex, date, timestamp, id).run()

  const row = await env.leadership_diary.prepare(
    'SELECT * FROM entries WHERE id = ?'
  ).bind(id).first()

  return Response.json(rowToEntry(row))
}

export async function onRequestDelete({ params, request, env }) {
  if (!isAuthenticated(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  const existing = await env.leadership_diary.prepare(
    'SELECT id FROM entries WHERE id = ?'
  ).bind(id).first()

  if (!existing) {
    return Response.json({ error: 'Entry not found' }, { status: 404 })
  }

  await env.leadership_diary.prepare(
    'DELETE FROM entries WHERE id = ?'
  ).bind(id).run()

  return new Response(null, { status: 204 })
}
