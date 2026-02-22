const http = require('http');
const fs = require('fs');
const path = require('path');

const TARGET = path.join(__dirname, 'frontend/public/images/prestige-homestay-main.jpg');

const html = `<!DOCTYPE html><html><head><title>Upload Image</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
.z{border:3px dashed #555;border-radius:16px;padding:60px 40px;text-align:center;cursor:pointer;transition:border-color .2s;max-width:500px}
.z:hover,.z.d{border-color:#e50914}h2{margin:0 0 10px}p{color:#888}input{display:none}.s{margin-top:20px;color:#4ade80}</style></head><body>
<div class="z" id="z"><h2>Drop Prestige Homestay image here</h2><p>or click to browse</p><input type="file" id="f" accept="image/*"/><div class="s" id="s"></div></div>
<script>const z=document.getElementById('z'),f=document.getElementById('f'),s=document.getElementById('s');
z.onclick=()=>f.click();z.ondragover=e=>{e.preventDefault();z.classList.add('d')};z.ondragleave=()=>z.classList.remove('d');
z.ondrop=e=>{e.preventDefault();z.classList.remove('d');upload(e.dataTransfer.files[0])};f.onchange=()=>upload(f.files[0]);
function upload(file){if(!file)return;s.textContent='Uploading...';const fd=new FormData();fd.append('img',file);
fetch('/upload',{method:'POST',body:fd}).then(r=>r.json()).then(d=>{s.textContent=d.ok?'✅ Image saved! You can close this tab.':'❌ '+d.error}).catch(e=>s.textContent='❌ '+e)}</script></body></html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }
  if (req.method === 'POST' && req.url === '/upload') {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      // Find the start of image data after multipart headers
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const str = buf.toString('binary');
      const headerEnd = str.indexOf('\r\n\r\n');
      const footerStart = str.lastIndexOf('\r\n--' + boundary);
      const imgBuf = Buffer.from(str.substring(headerEnd + 4, footerStart), 'binary');
      fs.mkdirSync(path.dirname(TARGET), { recursive: true });
      fs.writeFileSync(TARGET, imgBuf);
      console.log(`✅ Saved ${imgBuf.length} bytes to ${TARGET}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, size: imgBuf.length }));
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(9090, () => console.log('Upload server at http://localhost:9090'));
