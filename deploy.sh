#!/bin/bash
###############################################################################
# deploy.sh — Deploy 3 aplikasi web rentan pada satu server
# vulnshop (8083), cyberjobs (8000), shadownews (8001)
# Menjalankan tiap app via gunicorn + systemd, nginx routing per domain.
###############################################################################
set -e

BASE="/opt"
declare -A PORTS=( ["vulnshop"]="8083" ["cyberjobs"]="8000" ["shadownews"]="8001" )
declare -A DOMAINS=( ["vulnshop"]="vulnshop.shieldwaf.my.id" ["cyberjobs"]="cybermart.shieldwaf.my.id" ["shadownews"]="shadowmart.shieldwaf.my.id" )

echo "[1] Install dependensi sistem"
sudo apt update && sudo apt install -y python3-venv nginx

for app in vulnshop cyberjobs shadownews; do
  port=${PORTS[$app]}
  echo "[2] Setup $app (port $port)"
  sudo mkdir -p $BASE/$app
  sudo cp $app/app.py $BASE/$app/app.py
  cd $BASE/$app
  sudo python3 -m venv venv
  sudo ./venv/bin/pip install -q flask gunicorn

  # Inisialisasi database (fungsi init_db di app)
  sudo ./venv/bin/python -c "import app; app.init_db()" 2>/dev/null || true

  # Systemd service
  sudo tee /etc/systemd/system/$app.service > /dev/null << EOF
[Unit]
Description=$app vulnerable web app
After=network.target
[Service]
WorkingDirectory=$BASE/$app
ExecStart=$BASE/$app/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:$port app:app
Restart=always
[Install]
WantedBy=multi-user.target
EOF
  cd - > /dev/null
done

echo "[3] Aktifkan service"
sudo systemctl daemon-reload
sudo systemctl enable --now vulnshop cyberjobs shadownews

echo "[4] Konfigurasi nginx routing per domain"
sudo tee /etc/nginx/sites-available/vulnweb > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAINS[vulnshop]};
    location / { proxy_pass http://127.0.0.1:${PORTS[vulnshop]}; proxy_set_header Host \$host; }
}
server {
    listen 80;
    server_name ${DOMAINS[cyberjobs]};
    location / { proxy_pass http://127.0.0.1:${PORTS[cyberjobs]}; proxy_set_header Host \$host; }
}
server {
    listen 80;
    server_name ${DOMAINS[shadownews]};
    location / { proxy_pass http://127.0.0.1:${PORTS[shadownews]}; proxy_set_header Host \$host; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/vulnweb /etc/nginx/sites-enabled/vulnweb
sudo nginx -t && sudo systemctl reload nginx

echo "[5] Verifikasi"
sleep 3
for app in vulnshop cyberjobs shadownews; do
  echo -n "  $app (${PORTS[$app]}): "
  curl -s http://127.0.0.1:${PORTS[$app]}/ -o /dev/null -w "%{http_code}\n"
done

echo "SELESAI. Pastikan port 80 & 443 terbuka di firewall provider."
