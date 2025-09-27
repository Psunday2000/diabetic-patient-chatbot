import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as Blob | null
  const uid = String(formData.get('uid') || 'anonymous')
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  await fs.promises.mkdir(uploadsDir, { recursive: true })

  const filename = `${uid}.jpg`
  const filepath = path.join(uploadsDir, filename)

  await fs.promises.writeFile(filepath, buffer)

  const url = `/uploads/avatars/${filename}`
  return NextResponse.json({ url })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const uid = url.searchParams.get('uid')
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 })

  const filepath = path.join(process.cwd(), 'public', 'uploads', 'avatars', `${uid}.jpg`)
  try {
    await fs.promises.unlink(filepath)
  } catch (err) {
    // ignore
  }
  return NextResponse.json({ ok: true })
}
