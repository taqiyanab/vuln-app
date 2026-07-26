# Vulnerable Web Apps — Deployment

Kumpulan tiga aplikasi web sengaja rentan untuk pengujian Web Application Firewall (WAF) berbasis ModSecurity. Digunakan sebagai target uji pada penelitian Tugas Akhir sistem ShieldWAF.

## Aplikasi

| Aplikasi | Tema | Port | Domain Uji |
|----------|------|------|------------|
| **vulnshop** | E-commerce | 8083 | vulnshop.shieldwaf.my.id |
| **cyberjobs** | Portal Lowongan Kerja | 8000 | cybermart.shieldwaf.my.id |
| **shadownews** | Portal Berita | 8001 | shadowmart.shieldwaf.my.id |

Ketiganya memiliki tema dan struktur berbeda untuk membuktikan kemampuan multi-tenancy WAF (satu WAF melindungi banyak aplikasi berbeda).

## Kerentanan yang Disediakan

Setiap aplikasi memuat celah keamanan untuk menguji deteksi WAF:

- **SQL Injection** — pada parameter pencarian dan login
- **Cross-Site Scripting (XSS)** — pada input yang ditampilkan kembali
- **Local File Inclusion (LFI)** — pada parameter pembacaan file
- **Endpoint media** (`/logo.jpg`) — untuk menguji anti-hotlinking

## Struktur

```
vulnweb-deploy/
├── vulnshop/
│   ├── app.py
│   └── requirements.txt
├── cyberjobs/
│   ├── app.py
│   └── requirements.txt
├── shadownews/
│   ├── app.py
│   └── requirements.txt
├── deploy.sh
└── README.md
```

## Cara Deploy

Jalankan pada server origin (di belakang WAF):

```bash
git clone <repo-url>
cd vulnweb-deploy
chmod +x deploy.sh
./deploy.sh
```

Script akan:
1. Memasang dependensi (Python venv, nginx)
2. Menyiapkan tiap aplikasi dengan gunicorn + systemd
3. Menginisialisasi basis data
4. Mengatur nginx sebagai routing per domain
5. Memverifikasi tiap aplikasi berjalan

## Arsitektur

```
Internet → WAF (ModSecurity + Reverse Proxy) → Server Origin
                                                 ├── vulnshop  (127.0.0.1:8083)
                                                 ├── cyberjobs (127.0.0.1:8000)
                                                 └── shadownews(127.0.0.1:8001)
```

WAF menerima seluruh trafik, menginspeksi berdasarkan rule, lalu meneruskan ke aplikasi origin sesuai domain. Aplikasi origin hanya mendengarkan pada localhost dan diakses melalui nginx.

## Catatan Firewall

Pastikan port 80 dan 443 terbuka pada firewall penyedia VPS agar WAF dapat meneruskan trafik ke origin.

## Peringatan

Aplikasi ini **sengaja dibuat rentan** untuk keperluan pengujian keamanan. Jangan gunakan di lingkungan produksi atau host yang menyimpan data sungguhan.
