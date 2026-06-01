import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DEPLOY_DIR = '/home/z/my-project/cpanel-deploy'

export async function GET() {
  const files = ['app.py', 'passenger_wsgi.py', 'requirements.txt', '.htaccess']

  let combined = ''
  combined += '='.repeat(70) + '\n'
  combined += 'VulnShop — cPanel Deployment Files\n'
  combined += 'Upload semua file ini ke folder Application root di cPanel\n'
  combined += '='.repeat(70) + '\n\n'

  for (const filename of files) {
    const filePath = path.join(DEPLOY_DIR, filename)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      combined += '#'.repeat(70) + '\n'
      combined += `# FILE: ${filename}\n`
      combined += '#'.repeat(70) + '\n'
      combined += content
      combined += '\n\n'
    } catch {
      combined += `# FILE: ${filename} — NOT FOUND\n\n`
    }
  }

  combined += '='.repeat(70) + '\n'
  combined += 'DEPLOYMENT INSTRUCTIONS\n'
  combined += '='.repeat(70) + '\n'
  combined += `
1. Buka cPanel > Software > Setup Python App
2. Create Application:
   - Python version: 3.11+
   - Application root: /home/USER/vulnshop
   - Application startup file: passenger_wsgi.py
   - Application Entry point: application
3. Upload file-file di atas ke Application root
4. Sesuaikan INTERP path di app.py dan passenger_wsgi.py
   (cek path di cPanel Python App Configuration)
5. pip install flask
6. Restart application
7. Test: buka URL + /health

Login demo:
- admin / admin
- alice / password
- bob / password

Daftar kerentanan: /vulns
`

  return new NextResponse(combined, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="vulnshop-cpanel-deploy.txt"',
    },
  })
}
