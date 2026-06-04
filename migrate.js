/**
 * One-time localStorage → D1 migration
 *
 * HOW TO RUN:
 *   1. Open your deployed app in Chrome/Safari
 *   2. Open DevTools → Console
 *   3. Paste the entire contents of this file and press Enter
 *
 * Safe to run multiple times — entries already in D1 are skipped by timestamp.
 * localStorage is only cleared when every entry migrates (or is skipped) successfully.
 */

;(async () => {
  const AUTH_HEADER = `Basic ${btoa('jhuarachi654@gmail.com:Brocky123!')}`
  const LS_KEY = 'leadershipDiary'

  // ── 1. Read localStorage ───────────────────────────────────────────────────
  const raw = localStorage.getItem(LS_KEY)
  if (!raw) {
    console.log('[migrate] Nothing to migrate — localStorage key not found.')
    return
  }

  let localEntries
  try {
    localEntries = JSON.parse(raw)
  } catch {
    console.error('[migrate] Could not parse localStorage — aborting.')
    return
  }

  if (!Array.isArray(localEntries) || localEntries.length === 0) {
    console.log('[migrate] localStorage is empty — nothing to do.')
    return
  }

  console.log(`[migrate] Found ${localEntries.length} local entries.`)

  // ── 2. Fetch existing D1 entries (for dedup by timestamp) ─────────────────
  let existingTimestamps
  try {
    const res = await fetch('/api/entries')
    if (!res.ok) throw new Error(`GET /api/entries returned ${res.status}`)
    const existing = await res.json()
    existingTimestamps = new Set(existing.map(e => e.timestamp))
    console.log(`[migrate] ${existing.length} entries already in D1.`)
  } catch (e) {
    console.error(`[migrate] Could not reach API — aborting. (${e.message})`)
    return
  }

  // ── 3. Post each entry ─────────────────────────────────────────────────────
  let migrated = 0
  let skipped  = 0
  let failed   = 0

  for (const entry of localEntries) {
    const label = entry.title || entry.caption || `photo@${entry.timestamp}`

    // Skip if a matching timestamp already exists in D1
    if (existingTimestamps.has(entry.timestamp)) {
      console.log(`  SKIP  "${label}" — already in D1`)
      skipped++
      continue
    }

    // Normalise shape to match what the API expects
    const payload = entry.type === 'photo'
      ? {
          entryType : 'photo',
          weekIndex : entry.weekIndex ?? 0,
          image     : entry.image ?? null,
          caption   : entry.caption ?? '',
          date      : entry.date,
          timestamp : entry.timestamp,
        }
      : {
          entryType : entry.entryType,
          weekIndex : entry.weekIndex ?? 0,
          title     : entry.title,
          content   : entry.content,
          date      : entry.date,
          timestamp : entry.timestamp,
        }

    try {
      const res = await fetch('/api/entries', {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json', 'Authorization': AUTH_HEADER },
        body    : JSON.stringify(payload),
      })

      if (res.ok) {
        console.log(`  OK    "${label}"`)
        migrated++
      } else {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        console.error(`  FAIL  "${label}" — ${body.error ?? res.status}`)
        failed++
      }
    } catch (e) {
      console.error(`  ERROR "${label}" — ${e.message}`)
      failed++
    }
  }

  // ── 4. Report & conditionally clear ───────────────────────────────────────
  console.log(
    `\n[migrate] Done — ${migrated} migrated, ${skipped} already existed, ${failed} failed.`
  )

  if (failed === 0) {
    localStorage.removeItem(LS_KEY)
    console.log('[migrate] localStorage cleared.')
  } else {
    console.warn(`[migrate] localStorage NOT cleared — fix the ${failed} failed entries and re-run.`)
  }
})()
