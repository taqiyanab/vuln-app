#!/usr/bin/env python3
"""
passenger_wsgi.py — Entry Point untuk cPanel Phusion Passenger

File ini adalah yang dibaca oleh Passenger di cPanel.
Passenger akan mencari variabel `application` yang merupakan WSGI app.

STRUKTUR CPANEL:
  ~/vulnshop/              <- Application Root (set di cPanel)
  ├── passenger_wsgi.py    <- Entry point (file ini)
  ├── app.py               <- Flask application utama
  ├── requirements.txt     <- Dependencies
  ├── data/                <- Database SQLite (auto-created)
  │   └── vulnshop.db
  └── static/              <- Static files (opsional)

CARA SETUP DI CPANEL:
  1. cPanel > Software > Setup Python App
  2. Create Application
     - Python version: 3.11+ (sesuai yang tersedia)
     - Application root: /home/USER/vulnshop
     - Application URL: domain/subdomain
     - Application startup file: passenger_wsgi.py
     - Application Entry point: application
  3. Setelah create, klik "Edit" di bagian requirements.txt
     lalu install: pip install flask
  4. Restart application
"""

import sys
import os

# Set working directory ke folder aplikasi
INTERP = os.path.expanduser('~/virtualenv/vulnshop/3.13/bin/python')

# Cek apakah kita berjalan di virtualenv yang benar
# Jika tidak, re-execute dengan interpreter yang benar
if sys.executable != INTERP:
    # Coba cari interpreter yang benar di virtualenv
    possible_interp = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                    '..', 'virtualenv', 'vulnshop', 'bin', 'python')
    # Fallback: gunakan python dari virtualenv yang aktif
    os.execl(INTERP, INTERP, *sys.argv)

# Import Flask app dari app.py
from app import app as application

# Jika ingin test lokal
if __name__ == "__main__":
    application.run()
