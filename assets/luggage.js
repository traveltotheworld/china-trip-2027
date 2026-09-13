(function(){
 const $=s=>document.querySelector(s);
 const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[m]));
 const idRaw=new URLSearchParams(location.search).get("id")||"";
 const id=idRaw.toLowerCase()==="rico"?"rikko":idRaw.toLowerCase();
 const waLink=v=>{const n=String(v||"").replace(/\D/g,"");return n?`https://wa.me/${n}`:""};
 async function getMembers(){
  try{const online=window.ChinaTripDB&&await window.ChinaTripDB.readKey("luggage_tags");if(Array.isArray(online))return online}catch(e){}
  const r=await fetch("data/luggage-tags.json",{cache:"no-store"});if(!r.ok)throw new Error("Data peserta tidak tersedia");return r.json();
 }
 async function init(){
  if(!id){$("#luggageContent").innerHTML='<div class="luggage-error"><strong>ID koper tidak ditemukan.</strong><br>Gunakan QR/NFC tag yang benar.</div>';return}
  try{
   const members=await getMembers();
   const m=members.find(x=>(x.id||"").toLowerCase()===id);
   if(!m)throw new Error("Data koper tidak ditemukan");
   const showName=m.qrShowName!==false;
   const showWa=m.qrShowWhatsapp!==false;
   const showEmail=m.qrShowEmail===true;
   const publicName=m.publicContactName||m.name||"Pemilik koper";
   const whatsapp=m.publicWhatsapp||m.whatsapp||"";
   const email=m.publicEmail||m.email||"";
   const luggageId=m.luggageId||(`CT27-${String(m.id).toUpperCase()}`);
   const prettyWa=whatsapp ? (String(whatsapp).startsWith("62") ? "+"+String(whatsapp) : whatsapp) : "";
   const rows=[];
   if(showName)rows.push(`<div class="luggage-row"><div class="luggage-row-icon">👤</div><div class="luggage-row-content"><span class="luggage-label">Nama</span><div class="luggage-value">${esc(publicName)}</div></div></div>`);
   if(showWa&&whatsapp)rows.push(`<div class="luggage-row"><div class="luggage-row-icon">💬</div><div class="luggage-row-content"><span class="luggage-label">WhatsApp</span><div class="luggage-value">${esc(prettyWa)}</div></div></div>`);
   if(showEmail&&email)rows.push(`<div class="luggage-row"><div class="luggage-row-icon">✉️</div><div class="luggage-row-content"><span class="luggage-label">Email</span><div class="luggage-value">${esc(email)}</div></div></div>`);
   if(m.publicNote)rows.push(`<div class="luggage-row"><div class="luggage-row-icon">💬</div><div class="luggage-row-content"><span class="luggage-label">Pesan</span><div class="luggage-value">${esc(m.publicNote)}</div></div></div>`);
   const wa=showWa?waLink(whatsapp):"";
   $("#luggageContent").innerHTML=`
    <div class="luggage-hero">
      <div class="travel-word">Travel</div>
      <div class="travel-kicker">TRAVEL · DISCOVER · MORE</div>
      <div class="travel-motto">EXPLORE<br>TOGETHER<br>CREATE MEMORIES</div>
      <div class="travel-stamp" aria-hidden="true">✈</div>
      <div class="travel-route" aria-hidden="true">✈ · · · · · · · ·</div>
      <div class="luggage-tag-icon" aria-hidden="true">🧳</div>
    </div>
    <div class="luggage-body">
      <h1 class="luggage-title">Jika Anda menemukan koper ini</h1>
      <p class="luggage-sub">Mohon bantu hubungi pemilik melalui informasi di bawah. Terima kasih ❤️</p>
      <div class="luggage-grid">${rows.join("")||'<div class="luggage-row"><div class="luggage-row-icon">🔒</div><div class="luggage-row-content"><div class="luggage-value">Informasi kontak belum diaktifkan.</div></div></div>'}</div>
      <div class="luggage-actions">${wa?`<a class="luggage-btn primary" href="${wa}" target="_blank" rel="noopener">💬 Hubungi via WhatsApp <span>›</span></a>`:""}</div>
      <div class="luggage-privacy">🔒 Halaman ini hanya menampilkan data pribadi yang dipilih admin. Data itinerary berada di halaman terpisah.</div>
    </div>
    <div class="luggage-footer" aria-label="Travel footer"></div>`;
   document.title=`Luggage ${luggageId} — China Trip 2027`;
  }catch(e){$("#luggageContent").innerHTML=`<div class="luggage-error"><strong>Data tidak dapat dimuat.</strong><br>${esc(e.message)}<br><br>Jika sedang offline, halaman ini harus sudah pernah dibuka/cache di perangkat.</div>`}
 }
 init();
})();
