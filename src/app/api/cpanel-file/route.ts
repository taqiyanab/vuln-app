import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DEPLOY_DIR = '/home/z/my-project/cpanel-deploy'

export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get('file')

  if (!filename) {
    return NextResponse.json({ error: 'file parameter required' }, { status: 400 })
  }

  // Only allow specific files
  const allowedFiles = ['app.py', 'passenger_wsgi.py', 'requirements.txt', '.htaccess']
  if (!allowedFiles.includes(filename)) {
    return NextResponse.json({ error: 'File not allowed' }, { status: 403 })
  }

  const filePath = path.join(DEPLOY_DIR, filename)

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return NextResponse.json({ content, filename })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
