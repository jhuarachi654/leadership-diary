export async function onRequestGet({ params, env }) {
  const key = Array.isArray(params.path) ? params.path.join('/') : params.path

  const object = await env.PHOTOS.get(key)
  if (!object) {
    return new Response('Image not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
}
