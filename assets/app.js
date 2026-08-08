
const $=s=>document.querySelector(s);
async function getJSON(path){
 const online=window.ChinaTripDB ? await window.ChinaTripDB.readPath(path) : null;
 if(online!==null)return online;
 const r=await fetch(path,{cache:"no-store"});
 if(!r.ok)throw new Error(path);
 return r.json();
}
function getMemberId(){return (new URLSearchParams(location.search).get("id")||localStorage.getItem("trip_member")||"septino").toLowerCase()}
function keepId(link){const id=getMemberId();if(link.includes("?"))return link+"&id="+id;return link+"?id="+id}
async function initHome(){
 const [members,trip]=await Promise.all([getJSON("data/members.json"),getJSON("data/trip.json")]);
 const id=getMemberId();const m=members.find(x=>x.id===id)||members[0];localStorage.setItem("trip_member",m.id);
 $("#travelerName").textContent=m.name;$("#travelerInitial").textContent=m.name[0].toUpperCase();
 $("#travelerEmail").textContent=m.email||"Email belum diisi";
 const tripDate=m.flightGroup==="group-a"?"03–14 MARCH 2027":"06–14 MARCH 2027";
 const heroTripDate=$("#heroTripDate");
 if(heroTripDate) heroTripDate.textContent=tripDate;
 const memberNumber=$("#memberNumber");
 if(memberNumber) memberNumber.textContent=String(m.member).padStart(2,"0")+" / "+String(members.length).padStart(2,"0");
 if($("#personalName")) $("#personalName").textContent=m.name||"Belum diisi";
 const wa=String(m.whatsapp||"").replace(/\D/g,"");
 const waText=m.whatsapp||"Belum diisi";
 if($("#personalWhatsapp")) $("#personalWhatsapp").textContent=waText;
 if($("#personalWhatsapp")){if(wa){$("#personalWhatsapp").href="https://wa.me/"+wa}else{$("#personalWhatsapp").removeAttribute("href")}}
 if($("#personalEmail")) $("#personalEmail").textContent=m.email||"Belum diisi";
 if($("#personalEmail")){if(m.email){$("#personalEmail").href="mailto:"+m.email}else{$("#personalEmail").removeAttribute("href")}}
 document.title=m.name+" — "+trip.title;
 document.querySelectorAll("[data-page]").forEach(a=>a.href=keepId(a.getAttribute("data-page")));

 const profileTrigger=$("#profileMenuTrigger");
 const travelMenu=$("#travelMenuSection");
 if(profileTrigger&&travelMenu){
  profileTrigger.onclick=()=>{
   const willOpen=travelMenu.hidden;
   travelMenu.hidden=!willOpen;
   profileTrigger.setAttribute("aria-expanded",String(willOpen));
   profileTrigger.classList.toggle("is-open",willOpen);
   if(willOpen){
    requestAnimationFrame(()=>travelMenu.scrollIntoView({behavior:"smooth",block:"start"}));
   }
  };
 }

}

const ITINERARY_LOCATION_RULES=[
 ["Batam Centre","Batam Centre Ferry Terminal"],
 ["Tanah Merah","Tanah Merah Ferry Terminal Singapore"],
 ["HarbourFront","HarbourFront Centre Singapore"],
 ["Changi Airport Terminal 3","Singapore Changi Airport Terminal 3"],
 ["Changi Airport","Singapore Changi Airport"],
 ["Shanghai Pudong Airport","Shanghai Pudong International Airport"],
 ["Shanghai Hongqiao Railway Station","Shanghai Hongqiao Railway Station"],
 ["Hongqiao Railway Station","Shanghai Hongqiao Railway Station"],
 ["Shangrao Railway Station","Shangrao Railway Station"],
 ["Wangxiangu Zhonglou Homestay","Wangxiangu Zhonglou Homestay"],
 ["Wangxian Valley","Wangxian Valley Scenic Area"],
 ["Sijing Night Market","Sijing Night Market Shanghai"],
 ["Jinshan North Station","Jinshan North Railway Station"],
 ["LEGOLAND Shanghai","LEGOLAND Shanghai Resort"],
 ["Shanghai Wild Animal Park","Shanghai Wild Animal Park"],
 ["Jian Home Apartment","Jian Home Serviced Apartment Shanghai"],
 ["Jing'an Temple","Jing'an Temple Shanghai"],
 ["Wukang Road","Wukang Road Shanghai"],
 ["Xintiandi","Xintiandi Shanghai"],
 ["Tianzifang","Tianzifang Shanghai"],
 ["The Bund","The Bund Shanghai"],
 ["Lujiazui","Lujiazui Shanghai"],
 ["Oriental Pearl Tower","Oriental Pearl Tower Shanghai"],
 ["Yuyuan Garden","Yuyuan Garden Shanghai"],
 ["Chenghuangmiao No.1 Shopping Center","Chenghuangmiao No.1 Shopping Center Shanghai"],
 ["Chenghuangmiao","Shanghai City God Temple"],
 ["Nanjing Road Pedestrian Street","Nanjing Road Pedestrian Street Shanghai"],
 ["Nanjing Road","Nanjing Road Pedestrian Street Shanghai"],
 ["Shanghai Romance Park","Shanghai Romance Park"],
 ["Zhujiajiao Ancient Town","Zhujiajiao Ancient Town Shanghai"],
 ["Zhujiajiao","Zhujiajiao Ancient Town Shanghai"],
 ["Suzhou South Railway Station","Suzhou South Railway Station"],
 ["Suzhou Railway Station","Suzhou Railway Station"],
 ["Suzhou Station","Suzhou Railway Station"],
 ["Madison Hotel Suzhou Railway Station","Madison Hotel Suzhou Railway Station"],
 ["Tiger Hill Pagoda","Tiger Hill Suzhou"],
 ["Tiger Hill","Tiger Hill Suzhou"],
 ["Lion Grove Garden","Lion Grove Garden Suzhou"],
 ["Pingjiang Road","Pingjiang Road Suzhou"],
 ["Humble Administrator's Garden","Humble Administrator's Garden Suzhou"],
 ["Hanshan Temple","Hanshan Temple Suzhou"],
 ["Qili Shantang Street","Shantang Street Suzhou"],
 ["Shantang Street","Shantang Street Suzhou"],
 ["Hangzhou West Railway Station","Hangzhou West Railway Station"],
 ["Lingyin Temple","Lingyin Temple Hangzhou"],
 ["Feilai Feng","Feilai Peak Hangzhou"],
 ["West Lake","West Lake Hangzhou"],
 ["Qinghefang","Qinghefang Ancient Street Hangzhou"],
 ["Hefang Street","Hefang Street Hangzhou"],
 ["Wulin Road Night Market","Wulin Road Night Market Hangzhou"],
 ["Xixi Wetland","Xixi National Wetland Park Hangzhou"],
 ["Song Dynasty Town","Songcheng Hangzhou"],
 ["Hangzhou Xiaoshan International Airport","Hangzhou Xiaoshan International Airport"],
 ["Hotel Hangzhou","Hangzhou"]
];

function itineraryLocation(activity){
 if(!activity)return null;
 const lower=activity.toLowerCase();

 // Tidak menampilkan tautan peta untuk perjalanan pesawat
 const isFlight=
   lower.includes("singapore airlines") ||
   lower.includes("pesawat") ||
   (lower.includes("airport") && lower.includes(" → ") &&
    (lower.includes("singapore → shanghai") ||
     lower.includes("hangzhou xiaoshan international airport → singapore")));

 if(isFlight)return null;

 // Ambil lokasi tujuan pada rute, atau lokasi yang disebut dalam aktivitas
 const destination=activity.includes("→")
   ? activity.split("→").pop().trim()
   : activity;

 for(const [keyword,query] of ITINERARY_LOCATION_RULES){
   if(destination.toLowerCase().includes(keyword.toLowerCase()) ||
      activity.toLowerCase().includes(keyword.toLowerCase())){
     return query;
   }
 }
 return null;
}

async function renderItinerary(){
 const members=await getJSON("data/members.json");
 const me=members.find(x=>x.id===getMemberId())||members[0];

 const earlyFile=me?.itineraryGroup==="septino-lina-raelyn"
   ? "data/itinerary-group-a-early.json"
   : "data/itinerary-group-b-early.json";

 const [earlyData,commonData]=await Promise.all([
   getJSON(earlyFile),
   getJSON("data/itinerary-common.json")
 ]);

 const days=[
   ...(earlyData.days||[]),
   ...(commonData.days||[])
 ].sort((a,b)=>(a.date||"").localeCompare(b.date||""));

 $("#content").innerHTML=`
   <div class="itinerary-table-list">
     ${days.map((day,dayIndex)=>`
       <section class="itinerary-table-card">
         <div class="itinerary-day-header">
           <div>
             <span class="eyebrow">Hari ${dayIndex+1}</span>
             <h3>${day.label||day.date}</h3>
           </div>
           <span class="activity-count">${(day.items||[]).length} aktivitas</span>
         </div>

         <div class="itinerary-table-wrap">
           <table class="itinerary-table">
             <thead>
               <tr>
                 <th>Waktu</th>
                 <th>Aktivitas</th>
                 <th>Aksi</th>
               </tr>
             </thead>
             <tbody>
               ${(day.items||[]).map(item=>`
                 <tr>
                   <td data-label="Waktu">
                     <span class="time-pill">${item.from}</span>
                     <span class="time-arrow">→</span>
                     <span class="time-pill">${item.to}</span>
                   </td>
                   <td data-label="Aktivitas">
                     <div class="activity-text">${item.activity}</div>
                   </td>
                   <td data-label="Aksi">
                     ${item.baiduMap===true && item.route
                       ? `<a class="map-btn navigate-btn compact-map-btn"
                              href="${baiduDirectionLink(item.route)}"
                              target="_blank"
                              rel="noopener"
                              aria-label="Buka rute di Baidu Maps">🧭 Navigate</a>`
                       : `<span class="no-action">—</span>`}
                   </td>
                 </tr>
               `).join("")}
             </tbody>
           </table>
         </div>
       </section>
     `).join("")}
   </div>`;
}
async function renderFlights(){
 const [members,data,bookingRefs]=await Promise.all([
  getJSON("data/members.json"),
  getJSON("data/flights.json"),
  fetch("data/booking-references.json",{cache:"no-store"}).then(r=>r.ok?r.json():{}).catch(()=>({}))
 ]);
 const me=members.find(x=>x.id===getMemberId())||members[0];
 const refOverride=bookingRefs?.[me.id]||{};
 const grp=data.groups.find(g=>g.id===me.flightGroup);

 if(!grp){
  $("#content").innerHTML="<div class='card'>Belum ada data penerbangan.</div>";
  return;
 }

 function flightCard(flight){
  const seat=flight.seats?.[me.id]||"Belum diisi";
  const baggage=flight.baggage||{};
  return `
  <section class="boarding-pass flight-card">
   <div class="bp-top">
    <div class="airline-mark">
     <div class="airline-logo">✦</div>
     <div>
      <span class="eyebrow light">${flight.type||"Penerbangan"}</span>
      <h2>${flight.airline} · ${flight.flight}</h2>
     </div>
    </div>
    <div class="aircraft-tag">${flight.aircraft||"Pesawat belum diisi"}</div>
   </div>

   <div class="bp-route">
    <div class="airport-block">
     <strong>${flight.departure.code}</strong>
     <span>${flight.departure.time}</span>
     <small>${flight.departure.airport}</small>
     <em>${flight.departure.terminal||""}</em>
    </div>
    <div class="flight-line"><span></span><b>✈</b><span></span></div>
    <div class="airport-block right">
     <strong>${flight.arrival.code}</strong>
     <span>${flight.arrival.time}</span>
     <small>${flight.arrival.airport}</small>
     <em>${flight.arrival.terminal||""}</em>
    </div>
   </div>

   <div class="bp-date">${flight.date||""}</div>

   <div class="bp-grid">
    <div class="bp-info"><small>Passenger</small><strong>${me.name}</strong></div>
    <div class="bp-info"><small>Seat</small><strong>${seat}</strong></div>
    <div class="bp-info"><small>${flight.airline} Booking Reference</small><strong>${flight.airline==="Xiamen Airlines"?(me.xiamenBookingReference||refOverride.xiamen||flight.referenceCode||"Belum diisi"):(me.bookingReference||refOverride.spring||flight.referenceCode||"Belum diisi")}</strong></div>
    <div class="bp-info"><small>Flight</small><strong>${flight.flight}</strong></div>
   </div>

   <div class="bp-divider"><span></span><b>••••••••••••••••••••••</b><span></span></div>

   <div class="bp-bottom">
    <div class="passenger-avatar">${me.name.slice(0,2).toUpperCase()}</div>
    <div class="baggage-list">
     <div><span>Personal Item</span><strong>${baggage.personalItem||"Belum diisi"}</strong></div>
     <div><span>Cabin Baggage</span><strong>${baggage.cabin||"Belum diisi"}</strong></div>
     <div><span>Checked Baggage</span><strong>${baggage.checked||"Belum diisi"}</strong></div>
    </div>
   </div>
  </section>`;
 }

 $("#content").innerHTML=`
  <div class="flight-list">
   ${flightCard(grp.outbound)}
   ${flightCard(grp.return)}
  </div>
  <section class="section-note">
   <span class="eyebrow">Travel note</span>
   <p class="lead">Data ini adalah ringkasan perjalanan dan bukan boarding pass resmi maskapai.</p>
  </section>`;
}
async function renderHotels(){
 const [hotels,roomData,members]=await Promise.all([
  getJSON("data/hotels.json"),
  getJSON("data/room-groups.json"),
  getJSON("data/members.json")
 ]);

 const currentMember=members.find(member=>member.id===getMemberId())||members[0];
 const currentGroup=currentMember.flightGroup||"group-b";
 const allRooms=(roomData.regions&&roomData.regions[0]&&roomData.regions[0].rooms)||[];
 const groupARooms=[{room:"Kamar 1",members:["Septino","Lina","Raelyn Xenaria Jayanthi"]}];

 const visibleHotels=hotels.filter(hotel=>{
  if(!hotel.groupOnly)return true;
  return hotel.groupOnly===currentGroup;
 });

 $("#content").innerHTML=visibleHotels.map(hotel=>{
  const city=String(hotel.city||"").toLowerCase();
  const displayDates=city==="shanghai"
   ? (currentGroup==="group-a"
      ? (hotel.datesGroupA||"04–09 Mar 2027")
      : (hotel.datesGroupB||"06–09 Mar 2027"))
   : hotel.dates;
  const rooms=city==="shangrao"?groupARooms:allRooms;

  return `
  <section class="hotel-city-card">
   <div class="hotel-city-head">
    <div class="hotel-city-copy">
     <span class="eyebrow">${hotel.city} • ${displayDates||""}</span>
     <h2>${hotel.name}</h2>
     <div class="hotel-address">${hotel.address||""}</div>
    </div>
    <a class="btn hotel-map-btn"
       href="${baiduLink(hotel.mapsQuery||hotel.name,hotel.city)}"
       target="_blank"
       rel="noopener">
     Buka Baidu Maps
    </a>
   </div>

   <details class="hotel-room-dropdown">
    <summary>
     <span class="hotel-room-summary-title"><span aria-hidden="true">🛏️</span> Pembagian Kamar</span>
     <span class="hotel-room-summary-meta">${rooms.length} kamar</span>
    </summary>
    <div class="hotel-room-dropdown-content">
     <div class="hotel-room-grid">
      ${rooms.map(room=>`
       <article class="hotel-room-card">
        <strong>${room.room}</strong>
        <span class="room-count">${room.members.length} Orang</span>
        <ul>${room.members.map(name=>`<li>${name}</li>`).join("")}</ul>
       </article>
      `).join("")}
     </div>
    </div>
   </details>
  </section>`;
 }).join("");
}
async function renderHSR(){
 const [members,data]=await Promise.all([
  getJSON("data/members.json"),
  getJSON("data/hsr.json")
 ]);
 const me=members.find(x=>x.id===getMemberId())||members[0];
 const group=me.flightGroup||"group-b";

 const filtered=data.filter(item=>{
  if(item.group){
   if(Array.isArray(item.group))return item.group.includes(group);
   return item.group===group||item.group==="all";
  }
  const dateText=String(item.date||"").toLowerCase();
  const routeText=String(item.route||"").toLowerCase();
  const earlyTrip=/03\s*mar|04\s*mar/.test(dateText)||routeText.includes("shangrao");
  return group==="group-a" ? true : !earlyTrip;
 });

 if(!filtered.length){
  $("#content").innerHTML="<div class='card'>Belum ada jadwal HSR untuk peserta ini.</div>";
  return;
 }

 $("#content").innerHTML=`<div class="travel-timeline hsr-timeline">${filtered.map(x=>`
  <article class="travel-timeline-item">
   <div class="travel-timeline-marker">🚄</div>
   <div class="travel-timeline-card">
    <div class="timeline-card-top">
     <div><span class="eyebrow">${x.date||""}</span><h2>${x.route||""}</h2></div>
     <span class="timeline-date">${x.train||"Belum diisi"}</span>
    </div>
    <div class="hsr-time-row">
     <strong>${x.time||"Waktu belum diisi"}</strong>
     <span>${x.station||"Stasiun belum diisi"}</span>
    </div>
   </div>
  </article>`).join("")}</div>`;
}
async function renderMembers(){
 const roomData=await getJSON("data/room-groups.json");

 $("#content").innerHTML=roomData.regions.map(region=>`
   <section class="simple-room-region">
     <div class="simple-region-title">
       <span class="eyebrow">Pembagian Kamar</span>
       <h2>${region.name}</h2>
     </div>

     <div class="simple-room-list">
       ${region.rooms.map(room=>`
         <article class="simple-room-card">
           <strong>${room.room}</strong>
           <span>${room.members.join(" - ")}</span>
         </article>
       `).join("")}
     </div>
   </section>
 `).join("");
}
if("serviceWorker" in navigator){
 window.addEventListener("load",async()=>{
   try{
     const reg=await navigator.serviceWorker.register("/sw.js?v=41",{updateViaCache:"none"});
     await reg.update();
   }catch(e){console.warn("Service worker update failed",e);}
 });
}

async function renderTripInfo(){
 const d=await getJSON("data/trip-info.json");
 $("#content").innerHTML=d.map(x=>`<article class="card"><span class="eyebrow">${x.icon} Trip Info</span><h4>${x.title}</h4><ul class="list">${x.items.map(i=>`<li>${i}</li>`).join("")}</ul></article>`).join("");
}


function baiduDirectionLink(route){
 const origin=encodeURIComponent(route.originZh);
 const destination=encodeURIComponent(route.destinationZh);
 const mode=encodeURIComponent(route.mode||"transit");
 const region=encodeURIComponent(route.regionZh||"中国");
 return `https://api.map.baidu.com/direction?origin=${origin}&destination=${destination}&mode=${mode}&region=${region}&output=html&src=webapp.chinatrip2027`;
}

function baiduLink(query,region){
 return `https://map.baidu.com/search/${encodeURIComponent(query)}/@?querytype=s&wd=${encodeURIComponent(query)}`;
}
