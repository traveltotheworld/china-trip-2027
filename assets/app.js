
const $=s=>document.querySelector(s);
async function getJSON(path){const r=await fetch(path);if(!r.ok)throw new Error(path);return r.json()}
function getMemberId(){return (new URLSearchParams(location.search).get("id")||localStorage.getItem("trip_member")||"septino").toLowerCase()}
function keepId(link){const id=getMemberId();if(link.includes("?"))return link+"&id="+id;return link+"?id="+id}
async function initHome(){
 const [members,trip]=await Promise.all([getJSON("data/members.json"),getJSON("data/trip.json")]);
 const id=getMemberId();const m=members.find(x=>x.id===id)||members[0];localStorage.setItem("trip_member",m.id);
 $("#travelerName").textContent=m.name;$("#welcomeName").textContent=m.name;$("#travelerInitial").textContent=m.name[0].toUpperCase();
 $("#travelerEmail").textContent=m.email||"Email belum diisi";$("#memberNumber").textContent=String(m.member).padStart(2,"0")+" / "+String(members.length).padStart(2,"0");
 $("#room").textContent=m.room||"Belum diisi";$("#roommates").textContent=m.roommates||"Belum diisi";document.title=m.name+" — "+trip.title;
 document.querySelectorAll("[data-page]").forEach(a=>a.href=keepId(a.getAttribute("data-page")));
 $("#emergencyBtn").onclick=()=>$("#emergencyModal").hidden=false;$("#closeModal").onclick=()=>$("#emergencyModal").hidden=true;
}
async function renderItinerary(){
 const members=await getJSON("data/members.json");
 const me=members.find(x=>x.id===getMemberId());
 let data;

 if(me?.itineraryGroup==="septino-lina-raelyn"){
   data=await getJSON("data/itinerary-septino-lina-raelyn.json");
 }else{
   data=await getJSON("data/itinerary.json");
 }

 const days=data.days||data;
 $("#content").innerHTML=days.map(day=>`
   <section class="itinerary-day card">
     <span class="eyebrow">${day.label||day.date}</span>
     ${(day.items||[]).map(item=>`
       <div class="timeline-item">
         <div class="timeline-time">${item.from}–${item.to}</div>
         <div class="timeline-content">
           <strong>${item.activity}</strong>
           ${item.locationId?`<a class="map-btn" href="${baiduLink(item.locationId)}">Buka Baidu Maps</a>`:""}
         </div>
       </div>
     `).join("")}
   </section>
 `).join("");
}
async function renderFlights(){
 const [members,data]=await Promise.all([getJSON("data/members.json"),getJSON("data/flights.json")]);
 const me=members.find(x=>x.id===getMemberId());
 const grp=data.groups.find(g=>g.id===me?.flightGroup);
 if(!grp){$("#content").innerHTML="<div class='card'>Belum ada data penerbangan.</div>";return;}

 const seat=me?.seat||"-";
 const initials=(me?.name||"Traveler").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

 $("#content").innerHTML=`
 <section class="boarding-pass">
   <div class="bp-top">
     <div class="airline-mark">
       <div class="airline-logo">✦</div>
       <div>
         <span class="eyebrow light">Singapore Airlines</span>
         <h2>${grp.flight}</h2>
       </div>
     </div>
     <div class="aircraft-tag">${grp.aircraft}</div>
   </div>

   <div class="bp-route">
     <div class="airport-block">
       <strong>SIN</strong>
       <span>${grp.departure.time}</span>
       <small>${grp.departure.airport}</small>
       <em>${grp.departure.terminal}</em>
     </div>
     <div class="flight-line">
       <span></span>
       <b>✈</b>
       <span></span>
     </div>
     <div class="airport-block right">
       <strong>PVG</strong>
       <span>${grp.arrival.time}</span>
       <small>${grp.arrival.airport}</small>
       <em>${grp.arrival.terminal}</em>
     </div>
   </div>

   <div class="bp-date">${grp.date}</div>

   <div class="bp-grid">
     <div class="bp-info">
       <small>Passenger</small>
       <strong>${me?.name||"Traveler"}</strong>
     </div>
     <div class="bp-info">
       <small>Seat</small>
       <strong>${seat}</strong>
     </div>
     <div class="bp-info">
       <small>Booking Reference</small>
       <strong>${grp.referenceCode}</strong>
     </div>
     <div class="bp-info">
       <small>Flight</small>
       <strong>${grp.flight}</strong>
     </div>
   </div>

   <div class="bp-divider"><span></span><b>••••••••••••••••••••••</b><span></span></div>

   <div class="bp-bottom">
     <div class="passenger-avatar">${initials}</div>
     <div class="baggage-list">
       <div><span>Personal Item</span><strong>${grp.baggage.personalItem}</strong></div>
       <div><span>Cabin Baggage</span><strong>${grp.baggage.cabin}</strong></div>
       <div><span>Checked Baggage</span><strong>${grp.baggage.checked}</strong></div>
     </div>
   </div>
 </section>

 <section class="section-note">
   <span class="eyebrow">Travel note</span>
   <p class="lead">Data ini adalah ringkasan perjalanan dan bukan boarding pass resmi maskapai.</p>
 </section>`;
}
async function renderHotels(){
 const d=await getJSON("data/hotels.json");$("#content").innerHTML=d.map(x=>`<article class="card"><span class="eyebrow">${x.city} • ${x.dates}</span><h4>${x.name}</h4><div class="meta">${x.address}</div><a class="btn" href="${baiduLink(x.mapsQuery||x.name,x.city)}">Buka Baidu Maps</a></article>`).join("");
}
async function renderHSR(){
 const d=await getJSON("data/hsr.json");$("#content").innerHTML=d.map(x=>`<article class="card"><span class="eyebrow">${x.date}</span><h4>${x.route}</h4><div class="meta">Kereta: ${x.train}<br>Waktu: ${x.time}<br>Stasiun: ${x.station}</div></article>`).join("");
}
async function renderMembers(){
 const d=await getJSON("data/members.json");$("#content").innerHTML=d.map(x=>`<article class="card"><span class="eyebrow">Member ${String(x.member).padStart(2,"0")}</span><h4>${x.name}</h4><div class="meta">${x.email||"Email belum diisi"}<br>${x.room} • ${x.roommates}</div></article>`).join("");
}
if("serviceWorker" in navigator){
 window.addEventListener("load",async()=>{
   try{
     const reg=await navigator.serviceWorker.register("/sw.js?v=10",{updateViaCache:"none"});
     await reg.update();
   }catch(e){console.warn("Service worker update failed",e);}
 });
}

async function renderTripInfo(){
 const d=await getJSON("data/trip-info.json");
 $("#content").innerHTML=d.map(x=>`<article class="card"><span class="eyebrow">${x.icon} Trip Info</span><h4>${x.title}</h4><ul class="list">${x.items.map(i=>`<li>${i}</li>`).join("")}</ul></article>`).join("");
}

function baiduLink(query,region){
 return `baidumap://map/place/search?query=${encodeURIComponent(query)}&region=${encodeURIComponent(region||"中国")}&src=webapp.chinatrip2027`;
}
