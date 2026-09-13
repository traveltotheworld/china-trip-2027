(function(){
 const $=s=>document.querySelector(s);
 const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[m]));
 const idRaw=new URLSearchParams(location.search).get("id")||"";
 const id=idRaw.toLowerCase()==="rico"?"rikko":idRaw.toLowerCase();
 const itineraryUrl=`itinerary.html?id=${encodeURIComponent(id)}`;
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
   const rows=[];
   if(showName)rows.push(`<div class="luggage-row"><span class="luggage-label">Nama</span><div class="luggage-value">${esc(publicName)}</div></div>`);
   if(showWa&&whatsapp)rows.push(`<div class="luggage-row"><span class="luggage-label">WhatsApp</span><div class="luggage-value">${esc(whatsapp)}</div></div>`);
   if(showEmail&&email)rows.push(`<div class="luggage-row"><span class="luggage-label">Email</span><div class="luggage-value">${esc(email)}</div></div>`);
   if(m.publicNote)rows.push(`<div class="luggage-row"><span class="luggage-label">Pesan</span><div class="luggage-value">${esc(m.publicNote)}</div></div>`);
   const wa=showWa?waLink(whatsapp):"";
   $("#luggageContent").innerHTML=`
    <span class="luggage-badge">CHINA TRIP 2027 • LUGGAGE</span>
    <h1 class="luggage-title">Jika Anda menemukan koper ini</h1>
    <p class="luggage-sub">Mohon bantu hubungi pemilik melalui informasi di bawah.</p>
    <div class="luggage-grid">${rows.join("")||'<div class="luggage-row">Informasi kontak belum diaktifkan.</div>'}</div>
    <div class="luggage-actions">${wa?`<a class="luggage-btn primary" href="${wa}" target="_blank" rel="noopener">💬 Hubungi WhatsApp</a>`:""}<a class="luggage-btn" href="${itineraryUrl}">✈️ Buka Itinerary</a></div>
    <div class="luggage-privacy">🔒 Halaman ini hanya menampilkan data pribadi yang dipilih admin. Data itinerary berada di halaman terpisah.</div>`;
   document.title=`Luggage ${luggageId} — China Trip 2027`;
  }catch(e){$("#luggageContent").innerHTML=`<div class="luggage-error"><strong>Data tidak dapat dimuat.</strong><br>${esc(e.message)}<br><br>Jika sedang offline, halaman ini harus sudah pernah dibuka/cache di perangkat.</div>`}
 }
 init();
})();
