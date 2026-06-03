export async function onRequestPost({ request, env }) {
  const formData = await request.formData()
  const file = formData.get('photo')

  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No photo file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'File must be an image' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const key = `photos/${Date.now()}-${crypto.randomUUID()}.${ext}`

  await env.PHOTOS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  return Response.json({ key, url: `/api/image/${key}` })
}
