export function money(v){
  return Number(v || 0).toFixed(2).replace('.', ',');
}
export function cleanPhone(v){
  return String(v || '').replace(/\D/g, '');
}
export function openPdfWindow(title, body){
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{font-family:Arial;padding:36px;color:#111}
      .head{display:flex;justify-content:space-between;border-bottom:3px solid #0b4dbb;padding-bottom:14px;margin-bottom:25px}
      h1{margin:0;color:#0b4dbb}.box{border:1px solid #ddd;border-radius:14px;padding:20px;margin:15px 0}
      table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #eee;padding:10px;text-align:left}
      .sign{margin-top:55px;border-top:1px solid #333;width:280px;text-align:center;padding-top:8px}
      button{padding:12px 18px;background:#0b4dbb;color:white;border:0;border-radius:8px}
    </style></head><body>
    <div class="head"><div><h1>Ideal Toldos</h1><p>Protegendo com qualidade</p></div><div><b>${title}</b><br/>Rio de Janeiro</div></div>
    ${body}
    <p><b>Condições:</b> 50% de entrada e 50% na entrega. Garantia de 3 meses contra defeitos de fabricação.</p>
    <div class="sign">Ideal Toldos & Coberturas</div><br/>
    <button onclick="window.print()">Salvar em PDF / Imprimir</button>
    </body></html>`);
  w.document.close();
}
export function sendWhatsApp(phone, text){
  const tel = cleanPhone(phone);
  if(!tel) return alert('WhatsApp do cliente não cadastrado.');
  window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(text)}`, '_blank');
}
