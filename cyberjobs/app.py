from flask import Flask, request, render_template_string
import sqlite3, os

app = Flask(__name__)
DB = "cyberjobs.db"

def init_db():
    if os.path.exists(DB): os.remove(DB)
    c = sqlite3.connect(DB); x = c.cursor()
    x.execute("CREATE TABLE users(id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)")
    x.execute("CREATE TABLE jobs(id INTEGER PRIMARY KEY, title TEXT, company TEXT, location TEXT, type TEXT, salary TEXT, color TEXT)")
    users = [(1,"admin","admin123","hr"),(2,"recruiter","hire2025","recruiter"),(3,"manager","mgr888","recruiter")]
    jobs = [
        (1,"Senior Backend Engineer","TechNova","Jakarta","Full-time","Rp 25-35jt","#3b82f6"),
        (2,"UI/UX Designer","PixelCraft","Bandung","Remote","Rp 12-18jt","#ec4899"),
        (3,"DevOps Specialist","CloudBase","Jakarta","Full-time","Rp 20-30jt","#10b981"),
        (4,"Data Analyst","DataWise","Surabaya","Hybrid","Rp 10-15jt","#f59e0b"),
        (5,"Security Engineer","SecureNet","Remote","Full-time","Rp 22-32jt","#ef4444"),
        (6,"Product Manager","StartupX","Jakarta","Full-time","Rp 28-40jt","#8b5cf6"),
    ]
    x.executemany("INSERT INTO users VALUES(?,?,?,?)", users)
    x.executemany("INSERT INTO jobs VALUES(?,?,?,?,?,?,?)", jobs)
    c.commit(); c.close()

BASE = """<!doctype html><html lang=id><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>CyberJobs</title><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}
body{background:#f1f5f9;color:#0f172a}
nav{display:flex;align-items:center;gap:28px;padding:16px 40px;background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:10}
.logo{font-size:24px;font-weight:800;color:#2563eb}.logo span{color:#0f172a}
nav a{color:#475569;text-decoration:none;font-size:15px;font-weight:500}nav a:hover{color:#2563eb}
.spacer{flex:1}
.btn{padding:9px 20px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;border:none}
.btn-p{background:#2563eb;color:#fff}
.hero{background:linear-gradient(135deg,#2563eb,#1e40af);color:#fff;padding:60px 40px;text-align:center}
.hero h1{font-size:40px;font-weight:800;margin-bottom:12px}
.hero p{font-size:17px;opacity:.9;margin-bottom:28px}
.hero form{display:flex;gap:0;max-width:520px;margin:0 auto}
.hero input{flex:1;padding:14px 18px;border:none;border-radius:10px 0 0 10px;font-size:15px}
.hero button{padding:14px 28px;border:none;background:#0f172a;color:#fff;border-radius:0 10px 10px 0;font-weight:600;cursor:pointer}
.wrap{max-width:1000px;margin:40px auto;padding:0 20px}
h2.section{font-size:22px;margin-bottom:24px}
.job{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;margin-bottom:16px;display:flex;align-items:center;gap:20px}
.job .ico{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;flex-shrink:0}
.job .info{flex:1}
.job .info h3{font-size:18px;margin-bottom:4px}
.job .info .comp{color:#64748b;font-size:14px}
.job .tags{display:flex;gap:8px;margin-top:8px}
.job .tag{font-size:12px;background:#f1f5f9;color:#475569;padding:3px 10px;border-radius:6px}
.job .sal{color:#16a34a;font-weight:700;font-size:15px}
.result{padding:16px 0;color:#b45309}
form.auth{max-width:380px;margin:50px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:12px}
form.auth input{width:100%;padding:12px;margin:8px 0;border:1px solid #cbd5e1;border-radius:8px}
form.auth button{width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;margin-top:8px}
.badge{position:fixed;bottom:16px;right:16px;background:#0f172a;color:#60a5fa;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px}
</style></head><body>
<nav><div class=logo>Cyber<span>Jobs</span></div>
<a href=/>Beranda</a><a href=/jobs>Lowongan</a><a href=/search>Cari</a>
<div class=spacer></div><a class="btn btn-p" href=/login>Masuk Recruiter</a></nav>
{{body|safe}}
<div class=badge>⚠ VULN APP</div></body></html>"""

def page(body): return render_template_string(BASE, body=body)

def job_row(j):
    return f"""<div class=job><div class=ico style="background:{j[6]}">{j[2][0]}</div>
    <div class=info><h3>{j[1]}</h3><div class=comp>{j[2]} · {j[3]}</div>
    <div class=tags><span class=tag>{j[4]}</span></div></div>
    <div class=sal>{j[5]}</div></div>"""

@app.route("/")
def home():
    c = sqlite3.connect(DB); rows = c.execute("SELECT * FROM jobs LIMIT 6").fetchall(); c.close()
    jobs = "".join(job_row(j) for j in rows)
    body = f"""<div class=hero><h1>Temukan Karir Impianmu</h1>
    <p>Ribuan lowongan dari perusahaan teknologi terbaik</p>
    <form method=get action=/search><input name=q placeholder="Cari posisi, perusahaan..."><button>Cari Lowongan</button></form></div>
    <div class=wrap><h2 class=section>Lowongan Terbaru</h2>{jobs}</div>"""
    return page(body)

@app.route("/jobs")
def jobs():
    c = sqlite3.connect(DB); rows = c.execute("SELECT * FROM jobs").fetchall(); c.close()
    return page(f"<div class=wrap><h2 class=section>Semua Lowongan</h2>{''.join(job_row(j) for j in rows)}</div>")

# VULN: SQLi + XSS
@app.route("/search")
def search():
    q = request.args.get("q","")
    body = "<div class=wrap><h2 class=section>Hasil Pencarian</h2>"
    if q:
        body += f"<div class=result>Mencari: {q}</div>"
        c = sqlite3.connect(DB)
        try:
            rows = c.execute(f"SELECT * FROM jobs WHERE title LIKE '%{q}%' OR company LIKE '%{q}%'").fetchall()
            body += "".join(job_row(j) for j in rows) if rows else "<div class=result>Tidak ada hasil.</div>"
        except Exception as e:
            body += f"<div class=result>Error: {e}</div>"
        c.close()
    else:
        body += "<div class=result>Masukkan kata kunci.</div>"
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
    return page(f"<form class=auth method=post><h2>Masuk Recruiter</h2><input name=username placeholder=Username><input name=password type=password placeholder=Password><button>Masuk</button></form>{msg}")

# VULN: LFI
@app.route("/cv")
def cv():
    f = request.args.get("file","")
    if f:
        try: return open(f).read()
        except Exception as e: return f"Error: {e}", 404
    return page("<div class=wrap><div class=result>Gunakan ?file= untuk lihat CV</div></div>")

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
