'use client'

import { useState } from 'react'

const STEPS = [
  {
    title: '1. Buat Python App di cPanel',
    desc: 'Buka cPanel → Software → Setup Python App → Create Application',
    details: [
      'Python version: Pilih 3.11 atau yang tersedia',
      'Application root: /home/USER/vulnshop',
      'Application URL: Pilih domain/subdomain',
      'Application startup file: passenger_wsgi.py',
      'Application Entry point: application',
    ],
  },
  {
    title: '2. Upload File ke Server',
    desc: 'Upload semua file ke folder Application root via File Manager atau FTP',
    details: [
      'app.py → Flask application utama',
      'passenger_wsgi.py → Entry point Passenger WSGI',
      'requirements.txt → Daftar dependencies',
      '.htaccess → Konfigurasi Apache routing',
      'Folder data/ akan otomatis dibuat oleh app.py',
    ],
  },
  {
    title: '3. Install Dependencies',
    desc: 'Di cPanel Python App, jalankan pip install',
    details: [
      'Klik nama aplikasi di daftar Python App',
      'Di bagian "Configuration", jalankan:',
      'pip install -r requirements.txt',
      'Atau manual: pip install flask',
    ],
  },
  {
    title: '4. Sesuaikan Path Virtualenv',
    desc: 'Edit INTERP di app.py dan passenger_wsgi.py',
    details: [
      'Cek path Python virtualenv di cPanel Python App',
      'Biasanya: ~/virtualenv/vulnshop/3.13/bin/python',
      'Ganti angka versi sesuai Python yang dipilih',
      'Edit baris INTERP di app.py (baris 25)',
      'Edit baris INTERP di passenger_wsgi.py (baris 27)',
    ],
  },
  {
    title: '5. Restart & Test',
    desc: 'Restart aplikasi dari cPanel dan test',
    details: [
      'Klik "Restart" di cPanel Python App',
      'Buka URL aplikasi di browser',
      'Halaman utama VulnShop harusnya muncul',
      'Cek /health endpoint untuk verifikasi',
      'Cek /vulns untuk daftar kerentanan',
    ],
  },
]

const FILE_TABS = [
  {
    name: 'app.py',
    lang: 'python',
    filename: '/api/cpanel-file/app.py',
  },
  {
    name: 'passenger_wsgi.py',
    lang: 'python',
    filename: '/api/cpanel-file/passenger_wsgi.py',
  },
  {
    name: 'requirements.txt',
    lang: 'text',
    filename: '/api/cpanel-file/requirements.txt',
  },
  {
    name: '.htaccess',
    lang: 'apache',
    filename: '/api/cpanel-file/.htaccess',
  },
]

const CHANGES = [
  {
    before: 'DB = "/tmp/vulnshop.db"',
    after: 'DB = os.path.join(BASE_DIR, "data", "vulnshop.db")',
    reason: 'Path /tmp/ bisa di-clear di cPanel. Gunakan path relatif ke folder aplikasi.',
  },
  {
    before: 'if __name__ == "__main__":\n    app.run(host="0.0.0.0", port=8083)',
    after: 'application = app\n# app.run() hanya untuk testing lokal',
    reason: 'cPanel Passenger WSGI membutuhkan variabel `application` sebagai entry point, bukan app.run().',
  },
  {
    before: 'Tidak ada INTERP check',
    after: 'INTERP = os.path.expanduser(\'~/virtualenv/.../bin/python\')\nos.execl(INTERP, INTERP, *sys.argv)',
    reason: 'Passenger bisa reload worker terus-menerus tanpa INTERP check. Ini mencegah infinite loop.',
  },
  {
    before: 'init_db() di dalam if __name__',
    after: 'init_db() dipanggil saat import (module level)',
    reason: 'Passenger tidak menjalankan __main__, jadi init_db() harus dipanggil saat module di-import.',
  },
]

export default function Home() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeFile, setActiveFile] = useState('app.py')
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const loadFile = async (filename: string) => {
    if (fileContents[filename]) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cpanel-file?file=${filename}`)
      const data = await res.json()
      setFileContents(prev => ({ ...prev, [filename]: data.content }))
    } catch {
      setFileContents(prev => ({ ...prev, [filename]: 'Error loading file' }))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-gray-100">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#141414] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="text-2xl font-bold">
            <span className="text-[#ff4757]">Vuln</span>
            <span>Shop</span>
          </div>
          <span className="text-xs bg-[#ff4757] text-white px-2 py-0.5 rounded-full font-bold">
            CPANEL DEPLOY
          </span>
          <div className="flex-1" />
          <a
            href="/api/cpanel-download"
            className="bg-[#ff4757] hover:bg-[#ff6b81] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Download All Files
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Title Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Deploy <span className="text-[#ff4757]">VulnShop</span> ke cPanel
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Panduan lengkap untuk menjalankan VulnShop Flask app di cPanel hosting
            menggunakan Phusion Passenger WSGI.
          </p>
        </div>

        {/* Changes Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-[#2ed573]">&#10003;</span>
            Perubahan Utama
          </h2>
          <div className="grid gap-4">
            {CHANGES.map((change, i) => (
              <div
                key={i}
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5"
              >
                <p className="text-sm text-[#ffa502] font-semibold mb-3">
                  {change.reason}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-[#0d0d0d] rounded-lg p-3">
                    <div className="text-[10px] text-red-400 font-bold mb-1 uppercase tracking-wider">
                      Sebelum (tidak kompatibel cPanel)
                    </div>
                    <code className="text-xs text-gray-400 whitespace-pre-wrap">
                      {change.before}
                    </code>
                  </div>
                  <div className="bg-[#0d0d0d] rounded-lg p-3">
                    <div className="text-[10px] text-green-400 font-bold mb-1 uppercase tracking-wider">
                      Sesudah (cPanel compatible)
                    </div>
                    <code className="text-xs text-gray-300 whitespace-pre-wrap">
                      {change.after}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Deployment Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-[#1e90ff]">&#9654;</span>
            Langkah Deploy
          </h2>
          <div className="grid gap-4">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`bg-[#141414] border rounded-xl overflow-hidden transition-all cursor-pointer ${
                  activeStep === i
                    ? 'border-[#ff4757]'
                    : 'border-[#2a2a2a] hover:border-[#ff4757]/50'
                }`}
                onClick={() => setActiveStep(i)}
              >
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
                {activeStep === i && (
                  <div className="px-5 pb-5 border-t border-[#2a2a2a] pt-4">
                    <ul className="space-y-2">
                      {step.details.map((detail, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-sm text-gray-300"
                        >
                          <span className="text-[#ff4757] mt-0.5">&#8226;</span>
                          {detail.startsWith('pip install') ||
                          detail.startsWith('~/') ? (
                            <code className="bg-[#0d0d0d] px-2 py-0.5 rounded text-xs">
                              {detail}
                            </code>
                          ) : (
                            detail
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* File Viewer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-[#ffa502]">&#128196;</span>
            File Structure
          </h2>

          {/* Directory Tree */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 mb-6">
            <div className="font-mono text-sm text-gray-300 space-y-1">
              <p className="text-[#ff4757] font-bold">~/vulnshop/</p>
              <p className="pl-4">
                &#9492;&#9472; <span className="text-[#ffa502]">passenger_wsgi.py</span>{' '}
                <span className="text-gray-500">← Entry point Passenger</span>
              </p>
              <p className="pl-4">
                &#9492;&#9472; <span className="text-[#2ed573]">app.py</span>{' '}
                <span className="text-gray-500">← Flask app utama</span>
              </p>
              <p className="pl-4">
                &#9492;&#9472; <span className="text-gray-400">requirements.txt</span>{' '}
                <span className="text-gray-500">← Dependencies</span>
              </p>
              <p className="pl-4">
                &#9492;&#9472; <span className="text-gray-400">.htaccess</span>{' '}
                <span className="text-gray-500">← Apache config</span>
              </p>
              <p className="pl-4">
                &#9492;&#9472; <span className="text-blue-400">data/</span>
              </p>
              <p className="pl-8">
                &#9492;&#9472; <span className="text-gray-400">vulnshop.db</span>{' '}
                <span className="text-gray-500">← SQLite DB (auto-created)</span>
              </p>
            </div>
          </div>

          {/* Code Tabs */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="flex border-b border-[#2a2a2a]">
              {FILE_TABS.map((tab) => (
                <button
                  key={tab.name}
                  className={`px-5 py-3 text-sm font-semibold transition-colors ${
                    activeFile === tab.name
                      ? 'bg-[#ff4757] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                  onClick={() => {
                    setActiveFile(tab.name)
                    loadFile(tab.name)
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <div className="p-5">
              {loading ? (
                <div className="text-gray-500 text-center py-10">
                  Loading...
                </div>
              ) : (
                <pre className="bg-[#0d0d0d] rounded-lg p-4 text-xs text-gray-300 overflow-x-auto max-h-[500px] overflow-y-auto font-mono">
                  {fileContents[activeFile] || 'Click tab to load file'}
                </pre>
              )}
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-[#ff4757]">&#9888;</span>
            Penting!
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-5">
              <h3 className="font-bold text-red-400 mb-2">
                Sesuaikan INTERP Path
              </h3>
              <p className="text-sm text-gray-400">
                Path virtualenv berbeda-beda tiap server. Cek di cPanel Python App
                bagian &quot;Configuration&quot;. Ganti <code className="bg-[#0d0d0d] px-1 rounded text-xs">~/virtualenv/vulnshop/3.13/bin/python</code> sesuai versi Python yang kamu pilih.
              </p>
            </div>
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-5">
              <h3 className="font-bold text-amber-400 mb-2">
                Aplikasi Ini Rentan!
              </h3>
              <p className="text-sm text-gray-400">
                VulnShop sengaja dibuat vulnerable untuk pengujian WAF. JANGAN
                deploy di server produksi yang sama dengan data sensitif. Gunakan
                subdomain/domain terpisah.
              </p>
            </div>
            <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5">
              <h3 className="font-bold text-blue-400 mb-2">
                .htaccess Path
              </h3>
              <p className="text-sm text-gray-400">
                Ganti <code className="bg-[#0d0d0d] px-1 rounded text-xs">$USER</code> di
                .htaccess dengan username cPanel kamu. Juga sesuaikan path virtualenv
                Python di directive PassengerPython.
              </p>
            </div>
            <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-5">
              <h3 className="font-bold text-green-400 mb-2">
                Database Auto-Create
              </h3>
              <p className="text-sm text-gray-400">
                Database SQLite akan otomatis dibuat di folder <code className="bg-[#0d0d0d] px-1 rounded text-xs">data/vulnshop.db</code> saat
                aplikasi pertama kali diakses. Pastikan folder memiliki write permission.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Copy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-[#2ed573]">&#128203;</span>
            Quick Commands (Terminal cPanel)
          </h2>
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 space-y-3">
            <div>
              <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Masuk ke virtualenv
              </div>
              <code className="bg-[#0d0d0d] px-3 py-1.5 rounded text-sm text-green-400 block">
                source ~/virtualenv/vulnshop/3.13/bin/activate
              </code>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Install dependencies
              </div>
              <code className="bg-[#0d0d0d] px-3 py-1.5 rounded text-sm text-green-400 block">
                pip install flask
              </code>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Set permission
              </div>
              <code className="bg-[#0d0d0d] px-3 py-1.5 rounded text-sm text-green-400 block">
                chmod 755 ~/vulnshop/passenger_wsgi.py ~/vulnshop/app.py
              </code>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Create data folder
              </div>
              <code className="bg-[#0d0d0d] px-3 py-1.5 rounded text-sm text-green-400 block">
                mkdir -p ~/vulnshop/data && chmod 755 ~/vulnshop/data
              </code>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
                Restart Passenger (manual)
              </div>
              <code className="bg-[#0d0d0d] px-3 py-1.5 rounded text-sm text-green-400 block">
                touch ~/vulnshop/passenger_wsgi.py
              </code>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] bg-[#141414] mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            VulnShop &mdash; cPanel Deployment Guide
          </span>
          <span className="text-[#ff4757]">
            &#9888; VULN APP
          </span>
        </div>
      </footer>
    </div>
  )
}
