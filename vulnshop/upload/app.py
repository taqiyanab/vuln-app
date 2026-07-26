#!/usr/bin/env python3
"""
VulnShop — Vulnerable E-Commerce App
Target pengujian WAF ShieldWAF — PSSN 2026
Kerentanan: OWASP Top 10:2025 + Web Scraping + Hotlinking + HTTP Referer Bypass
Port: 8083
"""

from flask import (Flask, request, render_template_string, redirect,
                   url_for, session, jsonify, make_response, send_file)
import sqlite3, os, subprocess, hashlib, pickle, base64, json, re

app = Flask(__name__)
app.secret_key = "vulnshop-secret-123"  # A05: Hardcoded secret

# ── DB ───────────────────────────────────────────────────────────────────────
DB = "/tmp/vulnshop.db"

def init_db():
    con = sqlite3.connect(DB)
    c = con.cursor()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT, password TEXT, role TEXT DEFAULT 'user',
        email TEXT, address TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT, price REAL, description TEXT,
        category TEXT, stock INTEGER, image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER, product_id INTEGER,
        quantity INTEGER, total REAL, status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY,
        product_id INTEGER, user_id INTEGER,
        rating INTEGER, comment TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    INSERT OR IGNORE INTO users VALUES
        (1,'admin','21232f297a57a5a743894a0e4a801fc3','admin','admin@vulnshop.com','Jl. Admin No.1'),
        (2,'alice','6384e2b2184bcbf58eccf10ca7a6563c','user','alice@email.com','Jl. Alice No.2'),
        (3,'bob','9f9d51bc70ef21ca5c14f307980a29d8','user','bob@email.com','Jl. Bob No.3'),
        (4,'charlie','d9b5f58f0b38198293971a323e6c4e61','user','charlie@email.com','Jl. Charlie No.4');
    INSERT OR IGNORE INTO products VALUES
        (1,'Laptop Gaming Pro',15000000,'Laptop gaming high-end dengan RTX 4090','Electronics',10,'https://placehold.co/400x300/1a1a2e/ffffff?text=Laptop+Gaming'),
        (2,'Smartphone Ultra',8500000,'Smartphone flagship terbaru 2025','Electronics',25,'https://placehold.co/400x300/16213e/ffffff?text=Smartphone'),
        (3,'Headphone Wireless',750000,'Headphone bluetooth noise-cancelling','Electronics',50,'https://placehold.co/400x300/0f3460/ffffff?text=Headphone'),
        (4,'Mechanical Keyboard',450000,'Keyboard mechanical RGB untuk gaming','Electronics',30,'https://placehold.co/400x300/533483/ffffff?text=Keyboard'),
        (5,'Gaming Mouse',350000,'Mouse gaming 16000 DPI wireless','Electronics',40,'https://placehold.co/400x300/e94560/ffffff?text=Gaming+Mouse'),
        (6,'Monitor 4K',4500000,'Monitor 4K 144Hz HDR gaming','Electronics',15,'https://placehold.co/400x300/1a1a2e/ffffff?text=Monitor+4K'),
        (7,'SSD 2TB',1200000,'SSD NVMe PCIe 4.0 2TB','Storage',60,'https://placehold.co/400x300/16213e/ffffff?text=SSD+2TB'),
        (8,'RAM DDR5 32GB',1800000,'RAM DDR5 6000MHz 32GB dual channel','Memory',35,'https://placehold.co/400x300/0f3460/ffffff?text=RAM+DDR5');
    """)
    con.commit()
    con.close()

def get_db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

# ── TEMPLATE BASE ─────────────────────────────────────────────────────────────
BASE = """<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VulnShop — {{ title }}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0d0d0d;--surface:#141414;--surface2:#1a1a1a;--border:#2a2a2a;
  --txt:#f0f0f0;--muted:#888;--accent:#ff4757;--accent2:#ff6b81;
  --green:#2ed573;--blue:#1e90ff;--amber:#ffa502;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh}
a{color:var(--accent);text-decoration:none}
a:hover{color:var(--accent2)}

/* Nav */
nav{background:var(--surface);border-bottom:1px solid var(--border);padding:0 24px;display:flex;align-items:center;gap:20px;height:60px;position:sticky;top:0;z-index:100}
.nav-brand{font-size:20px;font-weight:700;color:var(--accent);letter-spacing:-0.5px}
.nav-brand span{color:var(--txt)}
.nav-links{display:flex;gap:16px;flex:1}
.nav-links a{font-size:13px;color:var(--muted);font-weight:500;padding:6px 10px;border-radius:6px;transition:all .15s}
.nav-links a:hover{color:var(--txt);background:var(--surface2)}
.nav-user{display:flex;align-items:center;gap:10px;font-size:13px}
.nav-badge{background:var(--accent);color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:99px}

/* Main */
.container{max-width:1200px;margin:0 auto;padding:32px 24px}
.page-title{font-size:28px;font-weight:700;margin-bottom:8px}
.page-sub{color:var(--muted);font-size:14px;margin-bottom:24px}

/* Cards */
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.card-body{padding:20px}
.grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.grid-4{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}

/* Product card */
.product-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:transform .2s,border-color .2s;cursor:pointer}
.product-card:hover{transform:translateY(-4px);border-color:var(--accent)}
.product-img{width:100%;height:200px;object-fit:cover;background:var(--surface2)}
.product-info{padding:16px}
.product-name{font-weight:600;font-size:14px;margin-bottom:6px}
.product-price{color:var(--accent);font-size:18px;font-weight:700;margin-bottom:8px}
.product-cat{font-size:11px;color:var(--muted);background:var(--surface2);padding:2px 8px;border-radius:99px;display:inline-block}

/* Form */
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.form-input{width:100%;padding:10px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--txt);font-size:14px;font-family:inherit;outline:none;transition:border-color .15s}
.form-input:focus{border-color:var(--accent)}
.form-input::placeholder{color:var(--muted)}
textarea.form-input{min-height:80px;resize:vertical}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;font-family:inherit;transition:all .15s}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent2)}
.btn-outline{background:transparent;color:var(--txt);border:1px solid var(--border)}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.btn-sm{padding:6px 12px;font-size:12px}
.btn-danger{background:#c0392b;color:#fff}

/* Alert */
.alert{padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:16px}
.alert-err{background:rgba(255,71,87,.1);border:1px solid rgba(255,71,87,.3);color:#ff6b81}
.alert-ok{background:rgba(46,213,115,.1);border:1px solid rgba(46,213,115,.3);color:#2ed573}
.alert-info{background:rgba(30,144,255,.1);border:1px solid rgba(30,144,255,.3);color:#1e90ff}

/* Table */
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th{background:var(--surface2);padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:700}
.table td{padding:10px 14px;border-bottom:1px solid var(--border)}
.table tr:hover td{background:rgba(255,255,255,.02)}

/* Badge */
.badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700}
.badge-red{background:rgba(255,71,87,.15);color:#ff4757}
.badge-green{background:rgba(46,213,115,.15);color:#2ed573}
.badge-blue{background:rgba(30,144,255,.15);color:#1e90ff}
.badge-amber{background:rgba(255,165,2,.15);color:#ffa502}

/* Vuln indicator */
.vuln-tag{position:fixed;bottom:16px;right:16px;background:#ff4757;color:#fff;font-size:10px;font-weight:700;padding:6px 10px;border-radius:8px;z-index:999;opacity:.8}

/* Search bar */
.search-bar{display:flex;gap:10px;margin-bottom:24px}
.search-bar .form-input{max-width:400px}

/* Hero */
.hero{background:linear-gradient(135deg,#1a0010,#0d0d0d);border:1px solid var(--border);border-radius:16px;padding:48px;margin-bottom:32px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-50%;right:-10%;width:400px;height:400px;background:radial-gradient(circle,rgba(255,71,87,.15),transparent 70%);pointer-events:none}
.hero h1{font-size:42px;font-weight:700;line-height:1.1;margin-bottom:12px}
.hero h1 span{color:var(--accent)}
.hero p{color:var(--muted);font-size:16px;margin-bottom:24px;max-width:500px}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-brand">Vuln<span>Shop</span></a>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/products">Produk</a>
    <a href="/search?q=laptop">Cari</a>
    {% if session.user_id %}
    <a href="/orders">Pesanan</a>
    <a href="/admin" style="color:var(--amber)">Admin</a>
    {% endif %}
  </div>
  <div class="nav-user">
    {% if session.username %}
      <span style="color:var(--muted)">👤 {{ session.username }}</span>
      {% if session.role=='admin' %}<span class="nav-badge">ADMIN</span>{% endif %}
      <a href="/logout" class="btn btn-sm btn-outline">Keluar</a>
    {% else %}
      <a href="/login" class="btn btn-sm btn-outline">Masuk</a>
      <a href="/register" class="btn btn-sm btn-primary">Daftar</a>
    {% endif %}
  </div>
</nav>

{% with messages = get_flashed_messages(with_categories=true) %}
  {% if messages %}
    <div style="padding:8px 24px">
      {% for cat, msg in messages %}
        <div class="alert alert-{{ 'ok' if cat=='success' else 'err' }}">{{ msg }}</div>
      {% endfor %}
    </div>
  {% endif %}
{% endwith %}

{{ content|safe }}

<div class="vuln-tag">⚠ VULN APP</div>
</body>
</html>"""

def render(title, content, **kw):
    return render_template_string(BASE, title=title, content=content, **kw)


# ══════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════

# ── HOME ──────────────────────────────────────────────────────
@app.route("/")
def index():
    db = get_db()
    products = db.execute("SELECT * FROM products LIMIT 8").fetchall()
    db.close()

    cards = ""
    for p in products:
        cards += f"""
        <a href="/product/{p['id']}" style="text-decoration:none">
          <div class="product-card">
            <img src="{p['image_url']}" class="product-img" alt="{p['name']}">
            <div class="product-info">
              <div class="product-name">{p['name']}</div>
              <div class="product-price">Rp {p['price']:,.0f}</div>
              <span class="product-cat">{p['category']}</span>
            </div>
          </div>
        </a>"""

    content = f"""
    <div class="container">
      <div class="hero">
        <h1>Belanja <span>Elektronik</span><br>Terbaik 2025</h1>
        <p>Temukan produk elektronik premium dengan harga terbaik. Pengiriman cepat ke seluruh Indonesia.</p>
        <a href="/products" class="btn btn-primary">Lihat Semua Produk</a>
      </div>
      <div class="page-title">Produk Unggulan</div>
      <div class="grid-4">{cards}</div>
    </div>"""
    return render("Home", content)


# ── PRODUCTS — A01: Mass data exposure, no rate limiting ─────
@app.route("/products")
def products():
    db = get_db()
    # A01: Tidak ada pagination, ekspos semua data sekaligus
    products = db.execute("SELECT * FROM products").fetchall()
    db.close()

    # A09: Tidak ada logging akses
    cards = ""
    for p in products:
        cards += f"""
        <a href="/product/{p['id']}" style="text-decoration:none">
          <div class="product-card">
            <img src="{p['image_url']}" class="product-img" alt="{p['name']}">
            <div class="product-info">
              <div class="product-name">{p['name']}</div>
              <div class="product-price">Rp {p['price']:,.0f}</div>
              <span class="product-cat">{p['category']}</span>
              <div style="font-size:11px;color:var(--muted);margin-top:4px">Stok: {p['stock']}</div>
            </div>
          </div>
        </a>"""

    content = f"""
    <div class="container">
      <div class="page-title">Semua Produk</div>
      <p class="page-sub">Menampilkan {len(products)} produk</p>
      <div class="grid-4">{cards}</div>
    </div>"""
    return render("Produk", content)


# ── SEARCH — A03: SQLi ────────────────────────────────────────
@app.route("/search")
def search():
    q = request.args.get("q", "")
    results = []
    error = ""

    if q:
        db = get_db()
        try:
            # A03: SQL Injection — input langsung dimasukkan ke query
            query = f"SELECT * FROM products WHERE name LIKE '%{q}%' OR description LIKE '%{q}%' OR category = '{q}'"
            results = db.execute(query).fetchall()
        except Exception as e:
            # A09: Error message bocor ke user
            error = f"Database error: {str(e)}"
        db.close()

    cards = ""
    for p in results:
        cards += f"""
        <a href="/product/{p['id']}" style="text-decoration:none">
          <div class="product-card">
            <img src="{p['image_url']}" class="product-img" alt="{p['name']}">
            <div class="product-info">
              <div class="product-name">{p['name']}</div>
              <div class="product-price">Rp {p['price']:,.0f}</div>
            </div>
          </div>
        </a>"""

    content = f"""
    <div class="container">
      <div class="page-title">Cari Produk</div>
      <form method="GET" action="/search" class="search-bar">
        <input class="form-input" name="q" value="{q}" placeholder="Cari laptop, smartphone...">
        <button class="btn btn-primary" type="submit">Cari</button>
      </form>
      {"<div class='alert alert-err'>"+error+"</div>" if error else ""}
      {"<p class='page-sub'>Hasil untuk: <strong>"+q+"</strong> ("+str(len(results))+" produk)</p>" if q else ""}
      <div class="grid-4">{cards if results else "<p style='color:var(--muted)'>Tidak ada hasil.</p>"}</div>
    </div>"""
    return render("Cari", content)


# ── PRODUCT DETAIL — Hotlinking target ───────────────────────
@app.route("/product/<int:pid>")
def product_detail(pid):
    db = get_db()
    # A01: IDOR — tidak ada cek kepemilikan
    p = db.execute("SELECT * FROM products WHERE id=?", (pid,)).fetchone()
    reviews = db.execute(
        "SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=?",
        (pid,)
    ).fetchall()
    db.close()

    if not p:
        return render("404", "<div class='container'><h2>Produk tidak ditemukan</h2></div>"), 404

    review_html = ""
    for r in reviews:
        # A03: XSS — comment tidak di-sanitize
        review_html += f"""
        <div style="border-bottom:1px solid var(--border);padding:12px 0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <strong style="font-size:13px">{r['username']}</strong>
            <span style="color:var(--amber)">{'★'*r['rating']}{'☆'*(5-r['rating'])}</span>
          </div>
          <p style="font-size:13px;color:var(--muted)">{r['comment']}</p>
        </div>"""

    content = f"""
    <div class="container">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px">
        <div>
          <!-- HOTLINKING TARGET: gambar produk bisa diembed dari domain lain -->
          <img src="{p['image_url']}" style="width:100%;border-radius:12px;border:1px solid var(--border)" alt="{p['name']}">
          <!-- Direct image links yang rentan hotlinking -->
          <div style="margin-top:12px;font-size:11px;color:var(--muted)">
            Direct URL: <code style="font-size:10px">/static/products/{pid}.jpg</code>
          </div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:8px">{p['category']}</div>
          <h1 style="font-size:28px;font-weight:700;margin-bottom:12px">{p['name']}</h1>
          <div style="font-size:32px;font-weight:700;color:var(--accent);margin-bottom:16px">
            Rp {p['price']:,.0f}
          </div>
          <p style="color:var(--muted);font-size:14px;line-height:1.6;margin-bottom:20px">{p['description']}</p>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
            <span class="badge badge-green">Stok: {p['stock']}</span>
            <span class="badge badge-blue">Free Ongkir</span>
          </div>
          <div style="display:flex;gap:10px">
            <a href="/order/{p['id']}" class="btn btn-primary">Beli Sekarang</a>
            <a href="/cart/add/{p['id']}" class="btn btn-outline">+ Keranjang</a>
          </div>
        </div>
      </div>

      <!-- Reviews section - A03: XSS via comment -->
      <div class="card">
        <div class="card-body">
          <h3 style="margin-bottom:16px">Ulasan Produk</h3>
          {review_html if review_html else "<p style='color:var(--muted)'>Belum ada ulasan.</p>"}
          {"<hr style='border-color:var(--border);margin:16px 0'>" if review_html else ""}
          <h4 style="margin-bottom:12px">Tulis Ulasan</h4>
          <form method="POST" action="/review/{p['id']}">
            <div class="form-group">
              <label class="form-label">Rating</label>
              <select class="form-input" name="rating" style="cursor:pointer">
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★☆ (4)</option>
                <option value="3">★★★☆☆ (3)</option>
                <option value="2">★★☆☆☆ (2)</option>
                <option value="1">★☆☆☆☆ (1)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Komentar</label>
              <!-- XSS: tidak ada sanitasi -->
              <textarea class="form-input" name="comment" placeholder="Tulis ulasan kamu..."></textarea>
            </div>
            <button class="btn btn-primary" type="submit">Kirim Ulasan</button>
          </form>
        </div>
      </div>
    </div>"""
    return render(p['name'], content)


# ── REVIEW — A03: XSS stored ────────────────────────────────
@app.route("/review/<int:pid>", methods=["POST"])
def add_review(pid):
    comment = request.form.get("comment", "")
    rating  = request.form.get("rating", 5)
    user_id = session.get("user_id", 1)

    db = get_db()
    # A03: XSS stored — comment disimpan tanpa sanitasi
    db.execute(
        "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)",
        (pid, user_id, rating, comment)
    )
    db.commit()
    db.close()
    return redirect(f"/product/{pid}")


# ── LOGIN — A07: No rate limit, A02: Plaintext/MD5 password ─
@app.route("/login", methods=["GET","POST"])
def login():
    error = ""
    if request.method == "POST":
        username = request.form.get("username","")
        password = request.form.get("password","")

        # A02: Password di-hash MD5 (lemah)
        pw_hash = hashlib.md5(password.encode()).hexdigest()

        db = get_db()
        # A03: SQLi di login
        query = f"SELECT * FROM users WHERE username='{username}' AND password='{pw_hash}'"
        user = db.execute(query).fetchone()
        db.close()

        if user:
            session["user_id"]  = user["id"]
            session["username"] = user["username"]
            session["role"]     = user["role"]
            return redirect("/")
        else:
            # A07: tidak ada rate limiting — bisa brute force
            error = "Username atau password salah"

    content = f"""
    <div class="container" style="max-width:400px">
      <div class="card">
        <div class="card-body">
          <h2 style="margin-bottom:4px">Masuk ke VulnShop</h2>
          <p style="color:var(--muted);font-size:13px;margin-bottom:20px">
            Demo: admin/admin, alice/password, bob/password
          </p>
          {"<div class='alert alert-err'>"+error+"</div>" if error else ""}
          <form method="POST">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input class="form-input" name="username" placeholder="admin">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" name="password" placeholder="••••••••">
            </div>
            <button class="btn btn-primary" style="width:100%" type="submit">Masuk</button>
          </form>
          <!-- A02: Hint password -->
          <div class="alert alert-info" style="margin-top:12px;font-size:11px">
            Hint: password disimpan sebagai MD5 hash di database
          </div>
        </div>
      </div>
    </div>"""
    return render("Login", content)


# ── REGISTER ──────────────────────────────────────────────────
@app.route("/register", methods=["GET","POST"])
def register():
    error = ""
    if request.method == "POST":
        username = request.form.get("username","")
        password = request.form.get("password","")
        email    = request.form.get("email","")
        role     = request.form.get("role","user")  # A08: Mass assignment

        pw_hash = hashlib.md5(password.encode()).hexdigest()
        db = get_db()
        try:
            # A08: Mass assignment — user bisa set role sendiri via hidden field
            db.execute(
                "INSERT INTO users (username,password,email,role) VALUES (?,?,?,?)",
                (username, pw_hash, email, role)
            )
            db.commit()
            return redirect("/login")
        except Exception as e:
            error = str(e)
        db.close()

    content = f"""
    <div class="container" style="max-width:400px">
      <div class="card">
        <div class="card-body">
          <h2 style="margin-bottom:20px">Daftar Akun</h2>
          {"<div class='alert alert-err'>"+error+"</div>" if error else ""}
          <form method="POST">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input class="form-input" name="username" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" name="email" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" name="password" required>
            </div>
            <!-- A08: Mass Assignment — hidden field role bisa dimanipulasi -->
            <input type="hidden" name="role" value="user">
            <button class="btn btn-primary" style="width:100%" type="submit">Daftar</button>
          </form>
        </div>
      </div>
    </div>"""
    return render("Register", content)


# ── ADMIN — A01: IDOR, A07: Broken Auth ──────────────────────
@app.route("/admin")
def admin():
    # A07: Cek role via session yang bisa dimanipulasi
    if session.get("role") != "admin":
        # A01: Tidak redirect dengan benar, langsung ekspos pesan error
        return render("Admin",
            "<div class='container'><div class='alert alert-err'>Akses ditolak. Butuh role admin.</div>"
            "<p style='color:var(--muted);margin-top:8px;font-size:13px'>Hint: Coba login sebagai admin/admin</p></div>")

    db = get_db()
    users    = db.execute("SELECT * FROM users").fetchall()
    orders   = db.execute("SELECT * FROM orders").fetchall()
    products = db.execute("SELECT * FROM products").fetchall()
    db.close()

    user_rows = "".join(f"""
    <tr>
      <td>{u['id']}</td><td>{u['username']}</td>
      <td style="font-family:monospace;font-size:11px">{u['password']}</td>
      <td>{u['email']}</td>
      <td><span class="badge {'badge-amber' if u['role']=='admin' else 'badge-blue'}">{u['role']}</span></td>
      <td>{u['address'] or '—'}</td>
    </tr>""" for u in users)

    content = f"""
    <div class="container">
      <div class="page-title">Admin Panel</div>
      <p class="page-sub">Data sensitif terekspos tanpa enkripsi</p>

      <!-- A02: Password hash terekspos -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:4px">👥 Data Users (MD5 Hash Exposed)</h3>
          <p style="color:var(--muted);font-size:12px;margin-bottom:16px">
            A02: Password hash MD5 terekspos di admin panel
          </p>
          <table class="table">
            <thead><tr><th>ID</th><th>Username</th><th>Password (MD5)</th><th>Email</th><th>Role</th><th>Alamat</th></tr></thead>
            <tbody>{user_rows}</tbody>
          </table>
        </div>
      </div>

      <!-- A02: Config sensitif -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <h3 style="margin-bottom:12px">⚙ Konfigurasi Sistem</h3>
          <table class="table">
            <tbody>
              <tr><td>DB_PATH</td><td style="font-family:monospace">/tmp/vulnshop.db</td></tr>
              <tr><td>SECRET_KEY</td><td style="font-family:monospace">vulnshop-secret-123</td></tr>
              <tr><td>DEBUG</td><td style="font-family:monospace">True</td></tr>
              <tr><td>Total Users</td><td>{len(users)}</td></tr>
              <tr><td>Total Orders</td><td>{len(orders)}</td></tr>
              <tr><td>Total Products</td><td>{len(products)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tools admin -->
      <div class="card">
        <div class="card-body">
          <h3 style="margin-bottom:12px">🔧 Admin Tools</h3>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a href="/admin/ping" class="btn btn-outline">Ping Server</a>
            <a href="/admin/backup" class="btn btn-outline">Backup DB</a>
            <a href="/admin/users" class="btn btn-outline">Manage Users</a>
            <a href="/.env" class="btn btn-outline">.env Config</a>
            <a href="/admin/logs" class="btn btn-outline">System Logs</a>
          </div>
        </div>
      </div>
    </div>"""
    return render("Admin Panel", content)


# ── PING — A03: Command Injection ────────────────────────────
@app.route("/admin/ping")
def admin_ping():
    host = request.args.get("host", "127.0.0.1")

    # A03: Command injection — input langsung dieksekusi
    try:
        output = subprocess.check_output(
            f"ping -c 2 {host}", shell=True,
            stderr=subprocess.STDOUT, timeout=5
        ).decode()
    except Exception as e:
        output = str(e)

    content = f"""
    <div class="container">
      <h2 style="margin-bottom:20px">Ping Tool</h2>
      <form method="GET">
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <input class="form-input" name="host" value="{host}" placeholder="IP atau domain" style="max-width:300px">
          <button class="btn btn-primary" type="submit">Ping</button>
        </div>
      </form>
      <div class="alert alert-info">
        <strong>A03: Command Injection</strong> — coba: <code>127.0.0.1; ls /</code> atau <code>127.0.0.1 && cat /etc/passwd</code>
      </div>
      <pre style="background:var(--surface2);padding:16px;border-radius:8px;font-size:12px;overflow-x:auto">{output}</pre>
    </div>"""
    return render("Ping Tool", content)


# ── FILE READ — A01: Path Traversal ──────────────────────────
@app.route("/admin/file")
def admin_file():
    path = request.args.get("path", "/tmp/vulnshop.db")

    # A01: Path traversal — tidak ada validasi path
    try:
        with open(path, "r", errors="replace") as f:
            content_data = f.read(5000)
    except Exception as e:
        content_data = f"Error: {str(e)}"

    content = f"""
    <div class="container">
      <h2 style="margin-bottom:20px">File Reader</h2>
      <form method="GET">
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <input class="form-input" name="path" value="{path}" placeholder="/etc/passwd" style="max-width:400px">
          <button class="btn btn-primary" type="submit">Baca</button>
        </div>
      </form>
      <div class="alert alert-info">
        <strong>A01: Path Traversal</strong> — coba: <code>/etc/passwd</code>, <code>/etc/shadow</code>, <code>../../etc/hosts</code>
      </div>
      <pre style="background:var(--surface2);padding:16px;border-radius:8px;font-size:12px;overflow-x:auto;max-height:400px">{content_data}</pre>
    </div>"""
    return render("File Reader", content)


# ── ENV FILE — A02: Security Misconfiguration ─────────────────
@app.route("/.env")
def env_file():
    # A02: Config sensitif terekspos publik
    env_content = """APP_ENV=production
DEBUG=True
SECRET_KEY=vulnshop-secret-123
DB_PATH=/tmp/vulnshop.db
ADMIN_PASSWORD=admin123
PAYMENT_API_KEY=sk_live_vulnshop_paymentkey_123456
SMTP_PASSWORD=smtp_pass_123
AWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STRIPE_SECRET=sk_live_xxxxxxxxxxxxxxxxxxxxx"""

    resp = make_response(env_content)
    resp.headers["Content-Type"] = "text/plain"
    return resp


# ── SSTI — A03: Server Side Template Injection ────────────────
@app.route("/greet")
def greet():
    name = request.args.get("name", "Guest")

    # A03: SSTI — input dirender sebagai template
    try:
        template = f"""
        <div class="container">
          <div class="hero">
            <h1>Halo, {name}!</h1>
            <p>Selamat datang di VulnShop.</p>
          </div>
          <div class="alert alert-info">
            <strong>A03: SSTI</strong> — coba: <code>/greet?name={{{{7*7}}}}</code> atau <code>/greet?name={{{{config}}}}</code>
          </div>
        </div>"""
        return render("Greeting", render_template_string(template))
    except Exception as e:
        return render("Greeting", f"<div class='container'><div class='alert alert-err'>{str(e)}</div></div>")


# ── DESERIALIZE — A08: Insecure Deserialization ───────────────
@app.route("/cart/import", methods=["GET","POST"])
def cart_import():
    result = ""
    if request.method == "POST":
        data = request.form.get("cart_data", "")
        try:
            # A08: Pickle deserialization — SANGAT BERBAHAYA
            decoded = base64.b64decode(data)
            cart = pickle.loads(decoded)
            result = f"<div class='alert alert-ok'>Cart diimport: {str(cart)}</div>"
        except Exception as e:
            result = f"<div class='alert alert-err'>Error: {str(e)}</div>"

    content = f"""
    <div class="container" style="max-width:600px">
      <h2 style="margin-bottom:20px">Import Keranjang</h2>
      {result}
      <div class="card">
        <div class="card-body">
          <div class="alert alert-info" style="margin-bottom:16px">
            <strong>A08: Insecure Deserialization</strong> — data pickle langsung di-deserialize tanpa validasi
          </div>
          <form method="POST">
            <div class="form-group">
              <label class="form-label">Cart Data (Base64 Pickle)</label>
              <textarea class="form-input" name="cart_data" placeholder="Base64 encoded pickle data..."></textarea>
            </div>
            <button class="btn btn-primary" type="submit">Import</button>
          </form>
        </div>
      </div>
    </div>"""
    return render("Import Cart", content)


# ── ORDERS — A01: IDOR ────────────────────────────────────────
@app.route("/order/<int:pid>")
def order(pid):
    db = get_db()
    p = db.execute("SELECT * FROM products WHERE id=?", (pid,)).fetchone()
    db.close()

    if not p:
        return redirect("/")

    content = f"""
    <div class="container" style="max-width:500px">
      <h2 style="margin-bottom:20px">Buat Pesanan</h2>
      <div class="card" style="margin-bottom:16px">
        <div class="card-body">
          <strong>{p['name']}</strong>
          <div style="color:var(--accent);font-size:20px;font-weight:700;margin-top:4px">Rp {p['price']:,.0f}</div>
        </div>
      </div>
      <form method="POST" action="/order/{pid}/confirm">
        <div class="form-group">
          <label class="form-label">Jumlah</label>
          <input class="form-input" type="number" name="qty" value="1" min="1">
        </div>
        <div class="form-group">
          <label class="form-label">Alamat Pengiriman</label>
          <textarea class="form-input" name="address" placeholder="Alamat lengkap..."></textarea>
        </div>
        <!-- A01: user_id bisa dimanipulasi via hidden field -->
        <input type="hidden" name="user_id" value="{session.get('user_id', 1)}">
        <button class="btn btn-primary" style="width:100%" type="submit">Konfirmasi Pesanan</button>
      </form>
    </div>"""
    return render("Pesan", content)


@app.route("/order/<int:pid>/confirm", methods=["POST"])
def order_confirm(pid):
    db = get_db()
    p = db.execute("SELECT * FROM products WHERE id=?", (pid,)).fetchone()

    # A01: IDOR — user_id dari form, bisa manipulasi beli atas nama user lain
    user_id  = request.form.get("user_id", session.get("user_id", 1))
    qty      = int(request.form.get("qty", 1))
    total    = p["price"] * qty if p else 0

    db.execute(
        "INSERT INTO orders (user_id, product_id, quantity, total) VALUES (?,?,?,?)",
        (user_id, pid, qty, total)
    )
    db.commit()
    db.close()
    return redirect(f"/orders?success=1")


@app.route("/orders")
def orders():
    # A01: IDOR — user bisa lihat semua order dengan manipulasi URL
    user_id = request.args.get("user_id", session.get("user_id"))

    db = get_db()
    # Tidak ada validasi apakah user_id milik session user
    rows = db.execute(
        "SELECT o.*, p.name, p.image_url FROM orders o JOIN products p ON o.product_id=p.id WHERE o.user_id=?",
        (user_id,)
    ).fetchall()
    db.close()

    success = request.args.get("success")

    order_rows = "".join(f"""
    <tr>
      <td>{r['id']}</td>
      <td><img src="{r['image_url']}" style="width:40px;height:40px;object-fit:cover;border-radius:6px"></td>
      <td>{r['name']}</td>
      <td>{r['quantity']}</td>
      <td>Rp {r['total']:,.0f}</td>
      <td><span class="badge badge-amber">{r['status']}</span></td>
    </tr>""" for r in rows)

    content = f"""
    <div class="container">
      {"<div class='alert alert-ok'>Pesanan berhasil dibuat!</div>" if success else ""}
      <div class="page-title">Pesanan Saya</div>
      <div class="alert alert-info" style="margin-bottom:16px;font-size:12px">
        <strong>A01: IDOR</strong> — coba ganti user_id di URL: <code>/orders?user_id=1</code>, <code>/orders?user_id=2</code>
      </div>
      <div class="card">
        <div class="card-body">
          <table class="table">
            <thead><tr><th>ID</th><th>Img</th><th>Produk</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{order_rows or "<tr><td colspan='6' style='color:var(--muted);text-align:center;padding:20px'>Belum ada pesanan</td></tr>"}</tbody>
          </table>
        </div>
      </div>
    </div>"""
    return render("Pesanan", content)


# ── API ENDPOINTS — Scraping target ──────────────────────────
@app.route("/api/products")
def api_products():
    # Target scraping: API tanpa autentikasi, rate limit, atau proteksi
    db = get_db()
    products = db.execute("SELECT * FROM products").fetchall()
    db.close()

    # A09: Tidak ada logging siapa yang akses API
    return jsonify({
        "status": "ok",
        "total": len(products),
        "data": [dict(p) for p in products]
    })


@app.route("/api/users")
def api_users():
    # A01: API user terekspos tanpa autentikasi
    # Target scraping data user
    db = get_db()
    users = db.execute("SELECT id,username,email,role,address FROM users").fetchall()
    db.close()

    return jsonify({
        "status": "ok",
        "data": [dict(u) for u in users]
    })


@app.route("/api/orders")
def api_orders():
    # A01: Semua order bisa diakses tanpa auth
    db = get_db()
    orders = db.execute("SELECT * FROM orders").fetchall()
    db.close()
    return jsonify({"data": [dict(o) for o in orders]})


# ── STATIC RESOURCES — Hotlinking target ─────────────────────
@app.route("/static/products/<path:filename>")
def static_products(filename):
    # Hotlinking: resource statis bisa diakses dari domain mana saja
    # Tidak ada Referer check sama sekali
    from flask import send_from_directory
    return send_from_directory("/tmp", "vulnshop.db")  # file placeholder


# ── HTTP REFERER target ───────────────────────────────────────
@app.route("/checkout")
def checkout():
    # Target HTTP Referer bypass: halaman sensitif
    # Seharusnya hanya bisa diakses dari halaman produk
    referer = request.headers.get("Referer", "")

    # Tidak ada validasi Referer yang benar
    content = f"""
    <div class="container" style="max-width:500px">
      <h2 style="margin-bottom:20px">Checkout</h2>
      <div class="alert alert-info">
        <strong>HTTP Referer:</strong> {referer or "(tidak ada)"}
      </div>
      <div class="card">
        <div class="card-body">
          <p style="color:var(--muted);margin-bottom:16px">Halaman ini seharusnya hanya bisa diakses dari halaman produk.</p>
          <div class="alert alert-err" style="font-size:12px">
            Kerentanan: tidak ada validasi Referer header — bisa diakses langsung atau dengan Referer palsu
          </div>
        </div>
      </div>
    </div>"""
    return render("Checkout", content)


# ── LOGOUT ────────────────────────────────────────────────────
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


# ── VULN SUMMARY ──────────────────────────────────────────────
@app.route("/vulns")
def vuln_summary():
    content = """
    <div class="container">
      <div class="page-title">⚠ Daftar Kerentanan VulnShop</div>
      <p class="page-sub">Untuk keperluan pengujian WAF ShieldWAF — PSSN 2026</p>
      <div class="grid-3">
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">💉</div>
          <strong>A03: SQL Injection</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /search?q=' OR 1=1--<br>
            URL: /login (username field)
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">📝</div>
          <strong>A03: XSS Stored</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /product/1 (form review)<br>
            Payload: &lt;script&gt;alert(1)&lt;/script&gt;
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">🔓</div>
          <strong>A01: IDOR</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /orders?user_id=1<br>
            URL: /admin/file?path=/etc/passwd
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">⚙</div>
          <strong>A03: Command Injection</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /admin/ping?host=127.0.0.1;ls
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">🌀</div>
          <strong>A03: SSTI</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /greet?name={{7*7}}<br>
            URL: /greet?name={{config}}
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">📦</div>
          <strong>A08: Insecure Deserialization</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /cart/import<br>
            Pickle payload via POST
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">🔑</div>
          <strong>A02: Konfigurasi Lemah</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /.env<br>
            URL: /admin (hash MD5 exposed)
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">🕷</div>
          <strong>Web Scraping</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /api/products<br>
            URL: /api/users<br>
            Tidak ada rate limit & auth
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">🔗</div>
          <strong>Hotlinking</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /static/products/*.jpg<br>
            Tidak ada Referer validation
          </p>
        </div></div>
        <div class="card"><div class="card-body">
          <div style="font-size:24px;margin-bottom:8px">🌐</div>
          <strong>HTTP Referer Bypass</strong>
          <p style="color:var(--muted);font-size:12px;margin-top:6px">
            URL: /checkout (tanpa Referer)<br>
            Header: X-Original-URL bypass
          </p>
        </div></div>
      </div>
    </div>"""
    return render("Daftar Kerentanan", content)


# ── HEALTH ────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({"status": "ok", "app": "VulnShop", "port": 8083})


if __name__ == "__main__":
    init_db()
    print("=" * 50)
    print("  VulnShop — Vulnerable E-Commerce App")
    print("  Port: 8083")
    print("  Kerentanan: OWASP Top 10 + Scraping + Hotlinking")
    print("  Login: admin/admin, alice/password, bob/password")
    print("  Vuln summary: http://localhost:8083/vulns")
    print("=" * 50)
    app.run(host="0.0.0.0", port=8083, debug=True)
