from flask import Flask, request, render_template_string
import sqlite3, os

app = Flask(__name__)
DB = "shadownews.db"

def init_db():
    if os.path.exists(DB): os.remove(DB)
    c = sqlite3.connect(DB); x = c.cursor()
    x.execute("CREATE TABLE users(id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)")
    x.execute("CREATE TABLE articles(id INTEGER PRIMARY KEY, title TEXT, category TEXT, author TEXT, excerpt TEXT, color TEXT)")
    users = [(1,"admin","admin123","editor"),(2,"jurnalis","news2025","author"),(3,"redaktur","redaksi88","author")]
    arts = [
        (1,"Teknologi AI Ubah Dunia Kerja 2025","Teknologi","Rina S.","Kecerdasan buatan kini merambah berbagai sektor industri...","#6366f1"),
        (2,"Ekonomi Digital Tumbuh Pesat","Ekonomi","Budi P.","Transaksi digital meningkat 40% tahun ini menurut data...","#10b981"),
        (3,"Timnas Menang Dramatis 3-2","Olahraga","Andi W.","Pertandingan sengit berakhir dengan kemenangan di menit akhir...","#ef4444"),
        (4,"Festival Budaya Nusantara Digelar","Budaya","Sari M.","Ribuan pengunjung memadati acara tahunan yang menampilkan...","#f59e0b"),
        (5,"Startup Lokal Raih Pendanaan Besar","Bisnis","Doni K.","Perusahaan rintisan asal Bandung berhasil mendapat suntikan dana...","#8b5cf6"),
        (6,"Tips Menjaga Kesehatan Mental","Kesehatan","Maya L.","Para ahli membagikan cara sederhana menjaga keseimbangan...","#ec4899"),
    ]
    x.executemany("INSERT INTO users VALUES(?,?,?,?)", users)
    x.executemany("INSERT INTO articles VALUES(?,?,?,?,?,?)", arts)
    c.commit(); c.close()

BASE = """<!doctype html><html lang=id><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>ShadowNews</title><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:Georgia,'Times New Roman',serif}
body{background:#f8f7f4;color:#1a1a1a}
nav{display:flex;align-items:center;gap:28px;padding:16px 40px;background:#1a1a2e;color:#fff;position:sticky;top:0;z-index:10}
.logo{font-size:26px;font-weight:800;letter-spacing:-.5px}.logo span{color:#ef4444}
nav a{color:#cbd5e1;text-decoration:none;font-size:15px;font-family:system-ui}nav a:hover{color:#fff}
.spacer{flex:1}
.search{display:flex;gap:0}
.search input{padding:8px 12px;border:none;border-radius:6px 0 0 6px;font-family:system-ui;width:180px}
.search button{padding:8px 16px;border:none;background:#ef4444;color:#fff;border-radius:0 6px 6px 0;cursor:pointer;font-family:system-ui}
.banner{background:#1a1a2e;color:#fff;padding:8px 40px;font-size:13px;font-family:system-ui;text-align:center;border-top:1px solid #333}
.wrap{max-width:1100px;margin:32px auto;padding:0 20px}
h1.section{font-size:15px;text-transform:uppercase;letter-spacing:2px;color:#ef4444;border-bottom:2px solid #ef4444;padding-bottom:8px;margin-bottom:24px;font-family:system-ui;font-weight:700}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:28px}
.card{background:#fff;border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;transition:.2s}
.card:hover{box-shadow:0 8px 24px rgba(0,0,0,.08)}
.card .thumb{height:160px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:700;font-family:system-ui;padding:20px;text-align:center}
.card .body{padding:18px}
.card .cat{display:inline-block;font-size:11px;font-family:system-ui;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.card h3{font-size:20px;line-height:1.3;margin-bottom:10px}
.card .excerpt{font-size:14px;color:#555;line-height:1.5;margin-bottom:12px}
.card .meta{font-size:12px;color:#999;font-family:system-ui}
.result{padding:16px 0;color:#b45309;font-family:system-ui}
form.auth{max-width:380px;margin:50px auto;padding:32px;background:#fff;border:1px solid #e5e5e5;border-radius:10px}
form.auth h2{margin-bottom:16px}
form.auth input{width:100%;padding:11px;margin:8px 0;border:1px solid #ccc;border-radius:6px;font-family:system-ui}
form.auth button{width:100%;padding:11px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-family:system-ui;font-weight:600;cursor:pointer;margin-top:8px}
.badge{position:fixed;bottom:16px;right:16px;background:#1a1a2e;color:#ef4444;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;font-family:system-ui}
</style></head><body>
<nav><div class=logo>Shadow<span>News</span></div>
<a href=/>Beranda</a><a href=/category>Kategori</a><a href=/search>Cari</a>
<div class=spacer></div>
<form class=search method=get action=/search><input name=q placeholder="Cari berita..."><button>Cari</button></form>
<a href=/login style="margin-left:16px">Masuk</a></nav>
<div class=banner>📰 Portal Berita Terkini — Update 24 Jam</div>
{{body|safe}}
<div class=badge>⚠ VULN APP</div></body></html>"""

def page(body): return render_template_string(BASE, body=body)

def card(a):
    return f"""<div class=card><div class=thumb style="background:{a[5]}">{a[1]}</div>
    <div class=body><span class=cat>{a[2]}</span><h3>{a[1]}</h3>
    <p class=excerpt>{a[4]}</p><div class=meta>Oleh {a[3]}</div></div></div>"""

@app.route("/")
def home():
    c = sqlite3.connect(DB); rows = c.execute("SELECT * FROM articles LIMIT 6").fetchall(); c.close()
    cards = "".join(card(a) for a in rows)
    return page(f"<div class=wrap><h1 class=section>Berita Utama</h1><div class=grid>{cards}</div></div>")

@app.route("/category")
def category():
    c = sqlite3.connect(DB); rows = c.execute("SELECT * FROM articles").fetchall(); c.close()
    return page(f"<div class=wrap><h1 class=section>Semua Kategori</h1><div class=grid>{''.join(card(a) for a in rows)}</div></div>")

# VULN: SQL Injection
@app.route("/search")
def search():
    q = request.args.get("q", "")
    body = f"<div class=wrap><h1 class=section>Hasil Pencarian</h1>"
    if q:
        # sengaja rentan XSS (q direfleksikan) + SQLi
        body += f"<div class=result>Menampilkan hasil untuk: {q}</div>"
        c = sqlite3.connect(DB)
        try:
            rows = c.execute(f"SELECT * FROM articles WHERE title LIKE '%{q}%'").fetchall()
            body += f"<div class=grid>{''.join(card(a) for a in rows)}</div>"
        except Exception as e:
            body += f"<div class=result>Error: {e}</div>"
        c.close()
    else:
        body += "<div class=result>Masukkan kata kunci pencarian.</div>"
    return page(body + "</div>")

# VULN: SQLi auth bypass
@app.route("/login", methods=["GET","POST"])
def login():
    msg = ""
    if request.method == "POST":
        u = request.form.get("username",""); p = request.form.get("password","")
        c = sqlite3.connect(DB)
        r = c.execute(f"SELECT * FROM users WHERE username='{u}' AND password='{p}'").fetchall()
        c.close()
        msg = f"<div class=result>Selamat datang, {u}!</div>" if r else f"<div class=result>Login gagal untuk {u}</div>"
    return page(f"<form class=auth method=post><h2>Masuk Redaksi</h2><input name=username placeholder=Username><input name=password type=password placeholder=Password><button>Masuk</button></form>{msg}")

# VULN: LFI
@app.route("/read")
def read():
    f = request.args.get("file","")
    if f:
        try: return open(f).read()
        except Exception as e: return f"Error: {e}", 404
    return page("<div class=wrap><div class=result>Gunakan ?file= untuk membaca artikel</div></div>")

@app.route("/assets/<path:x>")
def assets(x): return f"asset placeholder: {x}", 200

@app.route("/logo.jpg")
def logo():
    from flask import Response
    img=bytes.fromhex("ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffda0008010100003f00f7fa28a28a28a28a28a28a28a28a28a28a28ffd9")
    return Response(img,mimetype="image/jpeg")

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8000)
