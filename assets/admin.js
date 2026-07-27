
const DATASETS=[
 {id:"dashboard",title:"Dashboard",category:"Beranda",icon:"🏠",description:"Ringkasan data perjalanan",type:"dashboard"},
 {id:"members",title:"Peserta",category:"Data Utama",icon:"👥",path:"data/members.json",key:"members",description:"Nama, kontak, grup dan kamar peserta",type:"members"},
 {id:"flights",title:"Penerbangan",category:"Transportasi",icon:"✈️",path:"data/flights.json",key:"flights",description:"Jadwal penerbangan pergi dan pulang",type:"flights"},
 {id:"hotels",title:"Hotel",category:"Akomodasi",icon:"🏨",path:"data/hotels.json",key:"hotels",description:"Hotel, tanggal dan lokasi Baidu Maps",type:"hotels"},
 {id:"rooms",title:"Pembagian Kamar",category:"Akomodasi",icon:"🛏️",path:"data/room-groups.json",key:"room_groups",description:"Susunan kamar setiap kota",type:"rooms"},
 {id:"hsr",title:"Kereta HSR",category:"Transportasi",icon:"🚄",path:"data/hsr.json",key:"hsr",description:"Jadwal kereta antarkota",type:"hsr"},
 {id:"itinerary-a",title:"Itinerary Grup A",category:"Itinerary",icon:"🗓️",path:"data/itinerary-group-a-early.json",key:"itinerary_group_a_early",description:"Jadwal peserta Grup A",type:"itinerary"},
 {id:"itinerary-b",title:"Itinerary Grup B",category:"Itinerary",icon:"🗓️",path:"data/itinerary-group-b-early.json",key:"itinerary_group_b_early",description:"Jadwal peserta Grup B",type:"itinerary"},
 {id:"itinerary-common",title:"Itinerary Bersama",category:"Itinerary",icon:"📅",path:"data/itinerary-common.json",key:"itinerary_common",description:"Jadwal bersama seluruh peserta",type:"itinerary"},
 {id:"trip-info",title:"Informasi Penting",category:"Informasi",icon:"📌",path:"data/trip-info.json",key:"trip_info",description:"Catatan penting selama perjalanan",type:"tripinfo"},
 {id:"locations",title:"Lokasi Peta",category:"Informasi",icon:"📍",path:"data/locations.json",key:"locations",description:"Nama lokasi dan pencarian Baidu Maps",type:"locations"},
 {id:"trip",title:"Pengaturan Trip",category:"Pengaturan",icon:"⚙️",path:"data/trip.json",key:"trip",description:"Judul, tanggal dan kontak utama perjalanan",type:"trip"}
];

let activeDataset=DATASETS[0];
let workingData=null;
const $=s=>document.querySelector(s);
const clone=v=>JSON.parse(JSON.stringify(v));
const DRAFT_PREFIX="china_trip_admin_draft:";
function draftKey(key){return DRAFT_PREFIX+key}
function getDraft(key){try{return JSON.parse(localStorage.getItem(draftKey(key))||"null")}catch(e){return null}}
function saveDraft(key,value){localStorage.setItem(draftKey(key),JSON.stringify(value));updateDraftCount()}
function removeDraft(key){localStorage.removeItem(draftKey(key));updateDraftCount()}
function draftDatasets(){return DATASETS.filter(d=>d.key&&localStorage.getItem(draftKey(d.key))!==null)}
function updateDraftCount(){
 const n=draftDatasets().length;
 const el=$("#draftCount");if(!el)return;
 el.hidden=n===0;el.textContent=n+" perubahan";
}
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function baseData(path){return clone(window.CHINA_TRIP_DEFAULTS[path])}
function markChanged(){setStatus("Belum disimpan");$("#saveStatus").classList.add("changed")}
function setStatus(text){$("#saveStatus").textContent=text}
async function currentData(dataset){
 const draft=getDraft(dataset.key);
 if(draft!==null)return clone(draft);
 try{return await window.ChinaTripDB.readKey(dataset.key)}
 catch(err){console.warn(err);return baseData(dataset.path)}
}
function hideLoginPanel(){const p=$("#loginPanel");p.hidden=true;p.style.display="none"}
function showLoginPanel(){const p=$("#loginPanel");p.hidden=false;p.style.display="flex"}
async function showAdmin(){
 hideLoginPanel();
 $("#adminPanel").hidden=false;
 $("#adminPanel").style.display="block";
 buildTabs();updateDraftCount();
 await selectDataset("dashboard")
}
function buildTabs(){
 $("#adminTabs").innerHTML=DATASETS.map(d=>`
  <button type="button" data-id="${d.id}" class="${d.id===activeDataset.id?"active":""}">
   <span class="simple-menu-icon">${d.icon}</span>
   <span>${d.title}</span>
  </button>`).join("");
 $("#adminTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>selectDataset(b.dataset.id))
}
async function selectDataset(id){
 activeDataset=DATASETS.find(d=>d.id===id)||DATASETS[0];
 buildTabs();
 $("#editorCategory").textContent=activeDataset.category;
 $("#editorTitle").textContent=activeDataset.title;
 $("#editorDescription").textContent=activeDataset.description||"";
 const isDashboard=activeDataset.type==="dashboard";
 $("#editorActions").hidden=isDashboard;
 $("#backupPanel").hidden=!isDashboard;
 if(isDashboard){
  setStatus("Data tersambung");
  await renderDashboard();
  return
 }
 setStatus("Memuat data…");
 try{
  workingData=await currentData(activeDataset);
  setStatus("Data terbaru");
  renderEditor()
 }catch(err){setStatus("Gagal memuat");alert("Data gagal dimuat: "+err.message)}
}
function field(label,value,path,type="text",placeholder=""){
 return `<label class="cms-field"><span>${label}</span><input type="${type}" value="${esc(value)}" data-path="${path}" placeholder="${esc(placeholder)}"></label>`
}
function area(label,value,path){
 return `<label class="cms-field cms-field-wide"><span>${label}</span><textarea data-path="${path}">${esc(value)}</textarea></label>`
}
function checkbox(label,value,path){
 return `<label class="cms-check"><input type="checkbox" data-path="${path}" ${value?"checked":""}><span>${label}</span></label>`
}
function setByPath(obj,path,value){
 const parts=path.split(".");
 let cur=obj;
 for(let i=0;i<parts.length-1;i++){
  const k=/^\d+$/.test(parts[i])?Number(parts[i]):parts[i];
  if(cur[k]===undefined||cur[k]===null)cur[k]={};
  cur=cur[k];
 }
 const last=/^\d+$/.test(parts.at(-1))?Number(parts.at(-1)):parts.at(-1);
 cur[last]=value;
}
function bindFields(){
 $("#formEditor").querySelectorAll("[data-path]:not([data-path*=\"__\"])").forEach(el=>{
  const evt=el.type==="checkbox"?"change":"input";
  el.addEventListener(evt,()=>{
   let v=el.type==="checkbox"?el.checked:el.value;
   if(el.type==="number"&&v!=="")v=Number(v);
   setByPath(workingData,el.dataset.path,v);markChanged()
  })
 });
 $("#formEditor").querySelectorAll("[data-action]").forEach(el=>el.onclick=handleAction)
}
async function renderDashboard(){
 const ids=["members","hotels","flights","hsr","itinerary-common"];
 const results={};
 await Promise.all(ids.map(async id=>{
  const d=DATASETS.find(x=>x.id===id);
  try{results[id]=await currentData(d)}catch(e){results[id]=baseData(d.path)}
 }));
 const members=results.members||[];
 const hotels=results.hotels||[];
 const flightGroups=results.flights?.groups||[];
 const hsr=results.hsr||[];
 const days=results["itinerary-common"]?.days||[];
 $("#formEditor").innerHTML=`
  <section class="simple-welcome-card">
   <div>
    <span class="eyebrow">China Trip 2027</span>
    <h2>Kelola perjalanan dengan mudah</h2>
    <p>Pilih menu di sebelah kiri, ubah data, lalu tekan <strong>Simpan</strong>.</p>
   </div>
   <a href="index.html" class="admin-primary">Buka Website</a>
  </section>
  <div class="simple-stat-grid">
   <button data-open="members"><strong>${members.length}</strong><span>Peserta</span></button>
   <button data-open="hotels"><strong>${hotels.length}</strong><span>Hotel</span></button>
   <button data-open="flights"><strong>${flightGroups.length}</strong><span>Grup Flight</span></button>
   <button data-open="hsr"><strong>${hsr.length}</strong><span>Jadwal HSR</span></button>
  </div>
  <section class="simple-quick-card">
   <h3>Edit Cepat</h3>
   <div class="simple-quick-grid">${DATASETS.filter(d=>["members","flights","hotels","itinerary-common","trip-info","trip"].includes(d.id)).map(d=>`<button data-open="${d.id}"><span>${d.icon}</span><strong>${d.title}</strong><small>${d.description}</small></button>`).join("")}
   </div>
  </section>
  <section class="simple-help-card">
   <h3>Cara Menggunakan</h3>
   <div><b>1</b><span>Pilih menu yang ingin diubah.</span></div>
   <div><b>2</b><span>Edit data pada formulir.</span></div>
   <div><b>3</b><span>Tekan tombol <strong>Simpan</strong>.</span></div>
  </section>`;
 $("#formEditor").querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>selectDataset(b.dataset.open))
}
function renderEditor(){
 const t=activeDataset.type;
 if(t==="dashboard")return renderDashboard();
 if(t==="trip")renderTrip();
 else if(t==="itinerary")renderItinerary();
 else if(t==="flights"){renderFlights();return}
 else if(t==="hotels")renderHotels();
 else if(t==="hsr")renderSimpleList("HSR",["route","date","train","time","station","group"]);
 else if(t==="members")renderMembers();
 else if(t==="rooms")renderRooms();
 else if(t==="tripinfo")renderTripInfo();
 else if(t==="locations")renderSimpleList("Lokasi",["id","city","name","cn","query"]);
 bindFields()
}
function renderTrip(){
 $("#formEditor").innerHTML=`
 <article class="cms-record-card">
  <div class="cms-grid two">
   ${field("Judul perjalanan",workingData.title||"","title")}
   ${field("Subjudul / rute",workingData.subtitle||"","subtitle")}
   ${field("Tanggal perjalanan",workingData.date||"","date")}
   ${field("Titik pertemuan",workingData.meeting||"","meeting")}
   ${field("Ketua rombongan",workingData.leader||"","leader")}
   ${field("Nomor ketua",workingData.leaderPhone||"","leaderPhone")}
   ${field("WhatsApp utama",workingData.whatsapp||"","whatsapp")}
  </div>
 </article>`;
}
function renderItinerary(){
 if(!Array.isArray(workingData.days))workingData.days=[];
 $("#formEditor").innerHTML=`
 <article class="cms-record-card">
  <div class="cms-grid two">
   ${field("ID grup",workingData.groupId||"","groupId")}
   ${field("Berlaku untuk",workingData.appliesTo||"","appliesTo")}
  </div>
  ${field("Daftar ID peserta (pisahkan koma)",(workingData.members||[]).join(", "),"__rootMembers")}
  ${field("Status",workingData.status||"","status")}
 </article>`+
 (workingData.days||[]).map((day,di)=>`
 <section class="cms-day-card">
  <div class="cms-card-head">
   <div><span class="eyebrow">Hari ${di+1}</span><h3>${esc(day.label||day.date)}</h3></div>
   <button class="admin-danger small-action" data-action="delete-day" data-day="${di}">Hapus Hari</button>
  </div>
  <div class="cms-grid two">
   ${field("Tanggal",day.date,`days.${di}.date`,"date")}
   ${field("Judul tanggal",day.label,`days.${di}.label`)}
  </div>
  <div class="cms-activity-list">
   ${(day.items||[]).map((it,ii)=>`
    <article class="cms-activity-card">
     <div class="cms-activity-number">Aktivitas ${ii+1}</div>
     <div class="cms-grid time-grid">
      ${field("Dari",it.from,`days.${di}.items.${ii}.from`,"time")}
      ${field("Sampai",it.to,`days.${di}.items.${ii}.to`,"time")}
     </div>
     ${area("Aktivitas",it.activity,`days.${di}.items.${ii}.activity`)}
     ${checkbox("Tampilkan tombol Baidu Navigate",it.baiduMap,`days.${di}.items.${ii}.baiduMap`)}
     <div class="cms-grid route-grid">
      ${field("Asal Mandarin",it.route?.originZh||"",`days.${di}.items.${ii}.route.originZh`)}
      ${field("Tujuan Mandarin",it.route?.destinationZh||"",`days.${di}.items.${ii}.route.destinationZh`)}
      ${field("Wilayah",it.route?.regionZh||"",`days.${di}.items.${ii}.route.regionZh`)}
      ${field("Mode",it.route?.mode||"transit",`days.${di}.items.${ii}.route.mode`)}
     </div>
     <button class="admin-danger small-action" data-action="delete-item" data-day="${di}" data-item="${ii}">Hapus Aktivitas</button>
    </article>`).join("")}
  </div>
  <button class="admin-secondary" data-action="add-item" data-day="${di}">+ Tambah Aktivitas</button>
 </section>`).join("")+`<button class="admin-primary" data-action="add-day">+ Tambah Hari</button>`;

 workingData.days.forEach(d=>(d.items||[]).forEach(it=>{if(!it.route)it.route={originZh:"",destinationZh:"",regionZh:"",mode:"transit"}}));
 const rootMembers=$("#formEditor").querySelector('[data-path="__rootMembers"]');
 if(rootMembers)rootMembers.addEventListener("input",()=>{
  workingData.members=rootMembers.value.split(",").map(x=>x.trim()).filter(Boolean);markChanged()
 })
}
async function renderFlights(){
 if(!Array.isArray(workingData.groups))workingData.groups=[];
 let members=[];
 try{members=await window.ChinaTripDB.readKey("members")}
 catch(err){members=baseData("data/members.json")}

 $("#formEditor").innerHTML=workingData.groups.map((g,gi)=>{
  const groupMembers=members.filter(m=>m.flightGroup===g.id);
  return `
 <section class="cms-day-card flight-admin-group">
  <div class="cms-card-head">
   <div><span class="eyebrow">Grup penerbangan</span><h3>${esc(g.name||g.id)}</h3></div>
   <button class="admin-danger small-action" data-action="delete-flight-group" data-group="${gi}">Hapus Grup</button>
  </div>

  <div class="cms-grid two">
   ${field("ID grup",g.id||"",`groups.${gi}.id`)}
   ${field("Nama grup",g.name||"",`groups.${gi}.name`)}
  </div>

  <div class="flight-group-member-note">
   <strong>${groupMembers.length} peserta</strong>
   <span>${groupMembers.map(m=>esc(m.name)).join(" • ")||"Belum ada peserta pada grup ini"}</span>
  </div>

  ${["outbound","return"].map(type=>{
   const f=g[type]||{departure:{},arrival:{},baggage:{},seats:{}};
   g[type]=f;
   f.departure=f.departure||{};
   f.arrival=f.arrival||{};
   f.baggage=f.baggage||{};
   f.seats=f.seats||{};

   return `<article class="cms-flight-section">
    <div class="flight-section-title">
     <div>
      <span class="eyebrow">${type==="outbound"?"Departure":"Return"}</span>
      <h3>${type==="outbound"?"Penerbangan Pergi":"Penerbangan Pulang"}</h3>
     </div>
     <span class="flight-admin-badge">${esc(f.airline||"Maskapai")} ${esc(f.flight||"")}</span>
    </div>

    <h4>Informasi Penerbangan</h4>
    <div class="cms-grid three">
     ${field("Maskapai",f.airline||"",`groups.${gi}.${type}.airline`)}
     ${field("Nomor penerbangan",f.flight||"",`groups.${gi}.${type}.flight`)}
     ${field("Pesawat",f.aircraft||"",`groups.${gi}.${type}.aircraft`)}
     ${field("Tanggal",f.date||"",`groups.${gi}.${type}.date`)}
     ${field("Kode booking",f.referenceCode||"",`groups.${gi}.${type}.referenceCode`)}
    </div>

    <h4>Keberangkatan</h4>
    <div class="cms-grid four">
     ${field("Kode bandara",f.departure.code||"",`groups.${gi}.${type}.departure.code`)}
     ${field("Bandara",f.departure.airport||"",`groups.${gi}.${type}.departure.airport`)}
     ${field("Terminal",f.departure.terminal||"",`groups.${gi}.${type}.departure.terminal`)}
     ${field("Waktu",f.departure.time||"",`groups.${gi}.${type}.departure.time`,"time")}
    </div>

    <h4>Kedatangan</h4>
    <div class="cms-grid four">
     ${field("Kode bandara",f.arrival.code||"",`groups.${gi}.${type}.arrival.code`)}
     ${field("Bandara",f.arrival.airport||"",`groups.${gi}.${type}.arrival.airport`)}
     ${field("Terminal",f.arrival.terminal||"",`groups.${gi}.${type}.arrival.terminal`)}
     ${field("Waktu",f.arrival.time||"",`groups.${gi}.${type}.arrival.time`,"time")}
    </div>

    <h4>Bagasi</h4>
    <div class="cms-grid three">
     ${field("Personal item",f.baggage.personalItem||"",`groups.${gi}.${type}.baggage.personalItem`)}
     ${field("Kabin",f.baggage.cabin||"",`groups.${gi}.${type}.baggage.cabin`)}
     ${field("Bagasi tercatat",f.baggage.checked||"",`groups.${gi}.${type}.baggage.checked`)}
    </div>

    <details class="seat-assignment-panel" open>
     <summary>
      <span>💺 Pengaturan Kursi</span>
      <small>${type==="outbound"?"Kursi penerbangan pergi":"Kursi penerbangan pulang"}</small>
     </summary>
     <div class="seat-assignment-list">
      ${groupMembers.length?groupMembers.map(member=>`
       <label class="seat-assignment-row">
        <span>
         <strong>${esc(member.name)}</strong>
         <small>${esc(member.email||member.whatsapp||member.id)}</small>
        </span>
        <input type="text"
          value="${esc(f.seats[member.id]||"")}"
          data-path="groups.${gi}.${type}.seats.${member.id}"
          placeholder="Contoh: 59H">
       </label>`).join(""):`<p class="empty-seat-note">Tambahkan peserta ke ${esc(g.name||g.id)} melalui menu Peserta terlebih dahulu.</p>`}
     </div>
    </details>
   </article>`
  }).join("")}
 </section>`}).join("")+`<button class="admin-primary" data-action="add-flight-group">+ Tambah Grup Penerbangan</button>`;

 bindFields()
}
function renderHotels(){
 $("#formEditor").innerHTML=(workingData||[]).map((row,i)=>`
 <article class="cms-record-card">
  <div class="cms-card-head"><h3>${esc(row.city||"Hotel")} — ${i+1}</h3><button class="admin-danger small-action" data-action="delete-record" data-index="${i}">Hapus</button></div>
  <div class="cms-grid two">
   ${field("Kota",row.city||"",`${i}.city`)}
   ${field("Nama hotel",row.name||"",`${i}.name`)}
   ${field("Tanggal umum",row.dates||"",`${i}.dates`)}
   ${field("Tanggal Grup A",row.datesGroupA||"",`${i}.datesGroupA`)}
   ${field("Tanggal Grup B",row.datesGroupB||"",`${i}.datesGroupB`)}
   ${field("Khusus grup (group-a / group-b / kosong)",row.groupOnly||"",`${i}.groupOnly`)}
   ${field("Nama Mandarin / alamat",row.address||"",`${i}.address`)}
   ${field("Query Baidu Maps",row.mapsQuery||"",`${i}.mapsQuery`)}
   ${field("URL sumber / pemesanan",row.sourceUrl||"",`${i}.sourceUrl`,"url")}
  </div>
 </article>`).join("")+`<button class="admin-primary" data-action="add-record">+ Tambah Hotel</button>`;
}
function renderMembers(){
 const keys=["id","name","whatsapp","email","member","room","roommates","flightGroup","itineraryGroup"];
 $("#formEditor").innerHTML=`
 <div class="member-search-bar"><span>🔎</span><input id="memberSearch" type="search" placeholder="Cari nama, WhatsApp, email, kamar atau grup…"><b id="memberResultCount">${(workingData||[]).length} peserta</b></div>
 <div id="memberCards">${(workingData||[]).map((row,i)=>`
 <article class="cms-record-card member-admin-card" data-member-search="${esc([row.name,row.whatsapp,row.email,row.room,row.flightGroup].join(" ").toLowerCase())}">
  <div class="cms-card-head"><h3>${esc(row.name||"Peserta Baru")}</h3><button class="admin-danger small-action" data-action="delete-record" data-index="${i}">Hapus</button></div>
  <div class="cms-grid two">
   ${keys.map(k=>field(k,row[k]??"",`${i}.${k}`,k==="member"?"number":"text")).join("")}
  </div>
 </article>`).join("")}</div>
 <button class="admin-primary" data-action="add-record">+ Tambah Peserta</button>`;
 const search=$("#memberSearch");
 search.addEventListener("input",()=>{
  const q=search.value.trim().toLowerCase();let visible=0;
  $("#memberCards").querySelectorAll(".member-admin-card").forEach(card=>{const show=!q||card.dataset.memberSearch.includes(q);card.hidden=!show;if(show)visible++});
  $("#memberResultCount").textContent=visible+" peserta"
 })
}
function renderSimpleList(title,keys){
 $("#formEditor").innerHTML=(workingData||[]).map((row,i)=>`
 <article class="cms-record-card">
  <div class="cms-card-head"><h3>${title} ${i+1}</h3><button class="admin-danger small-action" data-action="delete-record" data-index="${i}">Hapus</button></div>
  <div class="cms-grid two">
   ${keys.map(k=>field(k,row[k]??"",`${i}.${k}`)).join("")}
  </div>
 </article>`).join("")+`<button class="admin-primary" data-action="add-record">+ Tambah ${title}</button>`;
}
function renderRooms(){
 if(!Array.isArray(workingData.regions))workingData.regions=[];
 $("#formEditor").innerHTML=workingData.regions.map((region,ri)=>`
 <section class="cms-day-card">
  <div class="cms-card-head"><h3>${esc(region.name)}</h3><button class="admin-danger small-action" data-action="delete-region" data-region="${ri}">Hapus Kota</button></div>
  <div class="cms-grid two">${field("ID",region.id,`regions.${ri}.id`)}${field("Nama kota",region.name,`regions.${ri}.name`)}</div>
  ${(region.rooms||[]).map((room,rmi)=>`
   <article class="cms-record-card">
    <div class="cms-card-head"><h4>${esc(room.room)}</h4><button class="admin-danger small-action" data-action="delete-room" data-region="${ri}" data-room="${rmi}">Hapus</button></div>
    ${field("Nama kamar",room.room,`regions.${ri}.rooms.${rmi}.room`)}
    ${field("Peserta (pisahkan koma)",(room.members||[]).join(", "),`regions.${ri}.rooms.${rmi}.__members`)}
   </article>`).join("")}
  <button class="admin-secondary" data-action="add-room" data-region="${ri}">+ Tambah Kamar</button>
 </section>`).join("")+`<button class="admin-primary" data-action="add-region">+ Tambah Kota</button>`;

 $("#formEditor").querySelectorAll('[data-path$=".__members"]').forEach(el=>{
  el.addEventListener("input",()=>{
   const p=el.dataset.path.split(".");
   workingData.regions[+p[1]].rooms[+p[3]].members=el.value.split(",").map(x=>x.trim()).filter(Boolean);markChanged()
  })
 })
}
function renderTripInfo(){
 $("#formEditor").innerHTML=(workingData||[]).map((row,i)=>`
 <article class="cms-record-card">
  <div class="cms-card-head"><h3>${esc(row.icon)} ${esc(row.title)}</h3><button class="admin-danger small-action" data-action="delete-record" data-index="${i}">Hapus</button></div>
  <div class="cms-grid two">${field("Ikon",row.icon,`${i}.icon`)}${field("Judul",row.title,`${i}.title`)}</div>
  ${area("Isi informasi — satu baris untuk satu poin",(row.items||[]).join("\n"),`${i}.__items`)}
 </article>`).join("")+`<button class="admin-primary" data-action="add-record">+ Tambah Informasi</button>`;

 $("#formEditor").querySelectorAll('[data-path$=".__items"]').forEach(el=>{
  el.addEventListener("input",()=>{
   const i=+el.dataset.path.split(".")[0];
   workingData[i].items=el.value.split("\n").map(x=>x.trim()).filter(Boolean);markChanged()
  })
 })
}
function handleAction(e){
 const a=e.currentTarget.dataset.action;
 if(a==="add-day")workingData.days.push({date:"2027-03-15",label:"Hari Baru",items:[]});
 if(a==="delete-day"&&confirm("Hapus hari ini?"))workingData.days.splice(+e.currentTarget.dataset.day,1);
 if(a==="add-item")workingData.days[+e.currentTarget.dataset.day].items.push({from:"09:00",to:"10:00",activity:"Aktivitas baru",baiduMap:false,route:{originZh:"",destinationZh:"",regionZh:"",mode:"transit"}});
 if(a==="delete-item"&&confirm("Hapus aktivitas ini?"))workingData.days[+e.currentTarget.dataset.day].items.splice(+e.currentTarget.dataset.item,1);
 if(a==="add-flight-group")workingData.groups.push({id:"group-new",name:"Grup Baru",travellers:[],outbound:{airline:"",flight:"",aircraft:"",date:"",referenceCode:"",departure:{code:"",airport:"",terminal:"",time:""},arrival:{code:"",airport:"",terminal:"",time:""},baggage:{personalItem:"",cabin:"",checked:""},seats:{}},return:{airline:"",flight:"",aircraft:"",date:"",referenceCode:"",departure:{code:"",airport:"",terminal:"",time:""},arrival:{code:"",airport:"",terminal:"",time:""},baggage:{personalItem:"",cabin:"",checked:""},seats:{}}});
 if(a==="delete-flight-group"&&confirm("Hapus grup penerbangan ini?"))workingData.groups.splice(+e.currentTarget.dataset.group,1);
 if(a==="add-record"){
  const t=activeDataset.type;
  if(t==="hotels")workingData.push({city:"",name:"",dates:"",datesGroupA:"",datesGroupB:"",address:"",mapsQuery:"",groupOnly:"",sourceUrl:""});
  if(t==="hsr")workingData.push({route:"",date:"",train:"",time:"",station:"",group:""});
  if(t==="members")workingData.push({id:"",name:"",whatsapp:"",email:"",member:workingData.length+1,room:"",roommates:"",flightGroup:"group-b",itineraryGroup:"main-group"});
  if(t==="tripinfo")workingData.push({title:"Informasi Baru",icon:"ℹ️",items:[]});
  if(t==="locations")workingData.push({id:"",city:"",name:"",cn:"",query:""})
 }
 if(a==="delete-record"&&confirm("Hapus data ini?"))workingData.splice(+e.currentTarget.dataset.index,1);
 if(a==="add-region")workingData.regions.push({id:"kota-baru",name:"Kota Baru",rooms:[]});
 if(a==="delete-region"&&confirm("Hapus kota ini?"))workingData.regions.splice(+e.currentTarget.dataset.region,1);
 if(a==="add-room")workingData.regions[+e.currentTarget.dataset.region].rooms.push({room:"Kamar Baru",members:[]});
 if(a==="delete-room"&&confirm("Hapus kamar ini?"))workingData.regions[+e.currentTarget.dataset.region].rooms.splice(+e.currentTarget.dataset.room,1);
 renderEditor();markChanged()
}
async function saveCurrent(){
 try{
  if(activeDataset.type==="itinerary"){
   workingData.days.forEach(d=>(d.items||[]).forEach(it=>{
    if(!it.baiduMap&&it.route&&!Object.values(it.route).some(Boolean))delete it.route
   }))
  }
  saveDraft(activeDataset.key,workingData);
  setStatus("Draft tersimpan");
  $("#saveStatus").classList.remove("changed");
 }catch(err){setStatus("Gagal menyimpan draft");alert("Draft gagal disimpan: "+err.message)}
}
async function publishAll(){
 const drafts=draftDatasets();
 if(!drafts.length){alert("Belum ada perubahan untuk dipublikasikan.");return}
 if(!confirm("Publish "+drafts.length+" bagian perubahan ke website?"))return;
 const btn=$("#publishBtn");btn.disabled=true;btn.textContent="Publishing…";
 try{
  for(const d of drafts){
   const value=getDraft(d.key);
   await window.ChinaTripDB.writeKey(d.key,value,d.description);
   removeDraft(d.key)
  }
  setStatus("Semua perubahan dipublish");
  alert("Perubahan berhasil dipublikasikan ke website.");
  await selectDataset(activeDataset.id)
 }catch(err){
  setStatus("Publish gagal");
  alert("Publish gagal: "+err.message);
  if(/sesi|login|jwt|token/i.test(err.message)){await window.ChinaTripDB.signOut();location.reload()}
 }finally{btn.disabled=false;btn.textContent="Publish";updateDraftCount()}
}
async function resetCurrent(){
 if(!confirm("Reset bagian ini ke data bawaan dan simpan ke Supabase?"))return;
 try{
  workingData=baseData(activeDataset.path);
  await window.ChinaTripDB.writeKey(activeDataset.key,workingData,activeDataset.description);
  renderEditor();setStatus("Data bawaan tersimpan online")
 }catch(err){alert("Reset gagal: "+err.message)}
}
async function exportAll(){
 try{
  setStatus("Menyiapkan backup…");
  const payload={app:"China Trip 2027",version:36,exportedAt:new Date().toISOString(),data:{}};
  for(const d of DATASETS.filter(x=>x.key))payload.data[d.path]=await currentData(d);
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="china-trip-2027-v36-full-backup.json";a.click();URL.revokeObjectURL(url);
  setStatus("Backup selesai")
 }catch(err){alert("Export gagal: "+err.message)}
}
async function importBackup(file){
 try{
  const p=JSON.parse(await file.text());
  if(!p.data)throw new Error("File backup tidak dikenali");
  let n=0;
  for(const d of DATASETS.filter(x=>x.key)){
   if(p.data[d.path]!==undefined){
    await window.ChinaTripDB.writeKey(d.key,p.data[d.path],d.description);n++
   }
  }
  alert(n+" bagian data berhasil diimpor ke Supabase.");
  await selectDataset(activeDataset.id)
 }catch(e){alert("Import gagal: "+e.message)}
}
async function resetAll(){
 if(!confirm("Reset seluruh data Supabase ke data bawaan V36?"))return;
 try{
  for(const d of DATASETS)await window.ChinaTripDB.writeKey(d.key,baseData(d.path),d.description);
  alert("Semua data berhasil direset.");await selectDataset(activeDataset.id)
 }catch(err){alert("Reset semua gagal: "+err.message)}
}
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault();$("#loginError").hidden=true;
 const btn=e.submitter;btn.disabled=true;btn.textContent="Masuk…";
 try{
  await window.ChinaTripDB.login($("#adminEmail").value.trim(),$("#adminPassword").value);
  hideLoginPanel();
  await showAdmin()
 }catch(err){
  $("#loginError").hidden=false;$("#loginError").textContent="Login gagal: "+err.message
 }finally{btn.disabled=false;btn.textContent="Masuk"}
});
$("#logoutBtn").onclick=async()=>{await window.ChinaTripDB.signOut();showLoginPanel();$("#adminPanel").hidden=true;location.reload()};
$("#saveBtn").onclick=saveCurrent;
$("#publishBtn").onclick=publishAll;
$("#reloadBtn").onclick=async()=>{
 if(activeDataset.key&&getDraft(activeDataset.key)!==null){
  if(!confirm("Batalkan draft pada bagian ini?"))return;
  removeDraft(activeDataset.key)
 }
 await selectDataset(activeDataset.id)
};
$("#exportBtn").onclick=exportAll;
$("#importInput").onchange=e=>{const f=e.target.files?.[0];if(f)importBackup(f);e.target.value=""};
(async()=>{const session=await window.ChinaTripDB.validSession();if(session){hideLoginPanel();await showAdmin()}else{showLoginPanel()}})();
