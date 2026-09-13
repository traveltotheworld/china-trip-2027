(function(){
 const $=s=>document.querySelector(s);
 const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[m]));
 const idRaw=new URLSearchParams(location.search).get("id")||"";
 const id=idRaw.toLowerCase()==="rico"?"rikko":idRaw.toLowerCase();
 const waLink=v=>{const n=String(v||"").replace(/\D/g,"");return n?`https://wa.me/${n}`:""};
 async function getMembers(){
  try{const online=window.ChinaTripDB&&await window.ChinaTripDB.readKey("luggage_tags");if(Array.isArray(online))return online}catch(e){}
  const r=await fetch("data/luggage-tags.json",{cache:"no-store"});if(!r.ok)throw new Error("Luggage data is unavailable");return r.json();
 }
 async function init(){
  if(!id){$("#luggageContent").innerHTML='<div class="luggage-error"><strong>Luggage ID not found.</strong><br>Please use the correct QR/NFC tag.</div>';return}
  try{
   const members=await getMembers();
   const m=members.find(x=>(x.id||"").toLowerCase()===id);
   if(!m)throw new Error("Luggage data not found");
   const showName=m.qrShowName!==false;
   const showWa=m.qrShowWhatsapp!==false;
   const showEmail=m.qrShowEmail===true;
   const publicName=m.publicContactName||m.name||"Luggage owner";
   const whatsapp=m.publicWhatsapp||m.whatsapp||"";
   const email=m.publicEmail||m.email||"";
   const luggageId=m.luggageId||(`CT27-${String(m.id).toUpperCase()}`);
   const prettyWa=whatsapp ? (String(whatsapp).startsWith("62") ? "+"+String(whatsapp) : whatsapp) : "";
   const rows=[];
   if(showName)rows.push(`<div class="luggage-row"><div class="luggage-row-icon">👤</div><div class="luggage-row-content"><span class="luggage-label">Name</span><div class="luggage-value">${esc(publicName)}</div></div></div>`);
   if(showWa&&whatsapp)rows.push(`<div class="luggage-row"><div class="luggage-row-icon">💬</div><div class="luggage-row-content"><span class="luggage-label">WhatsApp</span><div class="luggage-value">${esc(prettyWa)}</div></div></div>`);
   if(showEmail&&email)rows.push(`<div class="luggage-row"><div class="luggage-row-icon">✉️</div><div class="luggage-row-content"><span class="luggage-label">Email</span><div class="luggage-value">${esc(email)}</div></div></div>`);
   const wa=showWa?waLink(whatsapp):"";
   const mail=showEmail&&email?`mailto:${encodeURIComponent(email)}`:"";
   $("#luggageContent").innerHTML=`
    <div class="contact-card">
      <div class="contact-top">
        <div class="contact-icon">🧳</div>
        <div>
          <div class="contact-eyebrow">LUGGAGE CONTACT</div>
          <h1 class="luggage-title">If you find this luggage</h1>
          <p class="luggage-sub">Please contact the owner using the information below. Thank you ❤️</p>
        </div>
      </div>
      <div class="luggage-grid">${rows.join("")||'<div class="luggage-row"><div class="luggage-row-icon">🔒</div><div class="luggage-row-content"><div class="luggage-value">Contact information has not been enabled.</div></div></div>'}</div>
      <div class="contact-actions">
        ${wa?`<a class="luggage-btn primary" href="${wa}" target="_blank" rel="noopener"><span class="wa-mark">⌕</span><span>Contact via WhatsApp</span><b>›</b></a>`:""}
        ${mail?`<a class="luggage-btn email-btn" href="${mail}"><span class="email-mark">✉</span><span>Contact via Email</span><b>›</b></a>`:""}
      </div>
      <div class="contact-note">Only personal information approved by the owner is shown here.</div>
    </div>`;
   document.title=`Luggage ${luggageId} — China Trip 2027`;
  }catch(e){$("#luggageContent").innerHTML=`<div class="luggage-error"><strong>Unable to load data.</strong><br>${esc(e.message)}<br><br>If you are offline, this page must have been opened or cached on this device before.</div>`}
 }
 init();
})();
