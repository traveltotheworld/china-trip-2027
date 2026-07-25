
const ADMIN_PASSWORD_DEFAULT="Admin2027!";
const STORAGE_PREFIX="china_trip_override:";
const SESSION_KEY="china_trip_admin_session";

const DATASETS=[
 {id:"itinerary-a",title:"Itinerary Grup A — 2–6 Maret",category:"Itinerary",path:"data/itinerary-group-a-early.json",type:"itinerary"},
 {id:"itinerary-b",title:"Itinerary Grup B — 6 Maret",category:"Itinerary",path:"data/itinerary-group-b-early.json",type:"itinerary"},
 {id:"itinerary-common",title:"Itinerary Bersama — 7–14 Maret",category:"Itinerary",path:"data/itinerary-common.json",type:"itinerary"},
 {id:"flights",title:"Penerbangan",category:"Transportasi",path:"data/flights.json",type:"flights"},
 {id:"hotels",title:"Hotel",category:"Akomodasi",path:"data/hotels.json",type:"hotels"},
 {id:"hsr",title:"High Speed Rail",category:"Transportasi",path:"data/hsr.json",type:"hsr"},
 {id:"members",title:"Peserta",category:"Peserta",path:"data/members.json",type:"members"},
 {id:"rooms",title:"Pembagian Kamar",category:"Peserta",path:"data/room-groups.json",type:"rooms"},
 {id:"trip-info",title:"Informasi Perjalanan",category:"Informasi",path:"data/trip-info.json",type:"tripinfo"}
];

let activeDataset=DATASETS[0];
let workingData=null;
const $=s=>document.querySelector(s);
const clone=v=>JSON.parse(JSON.stringify(v));
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

function getAdminPassword(){return localStorage.getItem("china_trip_admin_password")||ADMIN_PASSWORD_DEFAULT}
function baseData(path){return clone(window.CHINA_TRIP_DEFAULTS[path])}
function currentData(path){
 const saved=localStorage.getItem(STORAGE_PREFIX+path);
 if(saved){try{return JSON.parse(saved)}catch(e){}}
 return baseData(path);
}
function markChanged(){setStatus("Ada perubahan belum disimpan")}
function setStatus(text){$("#saveStatus").textContent=text}
function showAdmin(){
 $("#loginPanel").hidden=true;$("#adminPanel").hidden=false;buildTabs();selectDataset(DATASETS[0].id)
}
function buildTabs(){
 $("#adminTabs").innerHTML=DATASETS.map(d=>`<button data-id="${d.id}" class="${d.id===activeDataset.id?"active":""}"><small>${d.category}</small><strong>${d.title}</strong></button>`).join("");
 $("#adminTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>selectDataset(b.dataset.id))
}
function selectDataset(id){
 activeDataset=DATASETS.find(d=>d.id===id)||DATASETS[0];
 workingData=currentData(activeDataset.path);
 buildTabs();
 $("#editorCategory").textContent=activeDataset.category;
 $("#editorTitle").textContent=activeDataset.title;
 setStatus(localStorage.getItem(STORAGE_PREFIX+activeDataset.path)?"Versi admin aktif":"Menggunakan data bawaan");
 renderEditor();
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
     setByPath(workingData,el.dataset.path,v);markChanged()
   })
 })
 $("#formEditor").querySelectorAll("[data-action]").forEach(el=>el.onclick=handleAction)
}
function renderEditor(){
 const t=activeDataset.type;
 if(t==="itinerary")renderItinerary();
 else if(t==="flights")renderFlights();
 else if(t==="hotels")renderSimpleList("Hotel",["city","name","dates","address","mapsQuery"]);
 else if(t==="hsr")renderSimpleList("HSR",["route","date","train","time","station","group"]);
 else if(t==="members")renderSimpleList("Peserta",["id","name","email","member","room","roommates","flightGroup","seat","itineraryGroup"]);
 else if(t==="rooms")renderRooms();
 else if(t==="tripinfo")renderTripInfo();
 bindFields()
}
function renderItinerary(){
 $("#formEditor").innerHTML=(workingData.days||[]).map((day,di)=>`
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
 // Ensure route objects exist for binding
 workingData.days.forEach(d=>d.items.forEach(it=>it.route??={originZh:"",destinationZh:"",regionZh:"",mode:"transit"}))
}
function renderFlights(){
 $("#formEditor").innerHTML=(workingData.groups||[]).map((g,gi)=>`
 <section class="cms-day-card">
  <div class="cms-card-head"><div><span class="eyebrow">Grup</span><h3>${esc(g.id)}</h3></div></div>
  ${field("ID Grup",g.id,`groups.${gi}.id`)}
  ${field("Nama peserta (pisahkan koma)",(g.travellers||[]).join(", "),`groups.${gi}.__travellers`)}
  ${["outbound","return"].map(type=>{
    const f=g[type];
    return `<article class="cms-flight-section">
      <h3>${type==="outbound"?"Penerbangan Pergi":"Penerbangan Pulang"}</h3>
      <div class="cms-grid three">
       ${field("Maskapai",f.airline,`groups.${gi}.${type}.airline`)}
       ${field("Nomor penerbangan",f.flight,`groups.${gi}.${type}.flight`)}
       ${field("Pesawat",f.aircraft,`groups.${gi}.${type}.aircraft`)}
       ${field("Tanggal",f.date,`groups.${gi}.${type}.date`)}
       ${field("Kode booking",f.referenceCode,`groups.${gi}.${type}.referenceCode`)}
      </div>
      <h4>Keberangkatan</h4>
      <div class="cms-grid four">
       ${field("Kode bandara",f.departure.code,`groups.${gi}.${type}.departure.code`)}
       ${field("Bandara",f.departure.airport,`groups.${gi}.${type}.departure.airport`)}
       ${field("Terminal",f.departure.terminal,`groups.${gi}.${type}.departure.terminal`)}
       ${field("Waktu",f.departure.time,`groups.${gi}.${type}.departure.time`,"time")}
      </div>
      <h4>Kedatangan</h4>
      <div class="cms-grid four">
       ${field("Kode bandara",f.arrival.code,`groups.${gi}.${type}.arrival.code`)}
       ${field("Bandara",f.arrival.airport,`groups.${gi}.${type}.arrival.airport`)}
       ${field("Terminal",f.arrival.terminal,`groups.${gi}.${type}.arrival.terminal`)}
       ${field("Waktu",f.arrival.time,`groups.${gi}.${type}.arrival.time`,"time")}
      </div>
      <h4>Bagasi</h4>
      <div class="cms-grid three">
       ${field("Personal item",f.baggage.personalItem,`groups.${gi}.${type}.baggage.personalItem`)}
       ${field("Kabin",f.baggage.cabin,`groups.${gi}.${type}.baggage.cabin`)}
       ${field("Bagasi tercatat",f.baggage.checked,`groups.${gi}.${type}.baggage.checked`)}
      </div>
    </article>`
  }).join("")}
 </section>`).join("");
 // custom travellers field
 $("#formEditor").querySelectorAll('[data-path$=".__travellers"]').forEach(el=>{
   el.addEventListener("input",()=>{
    const gi=Number(el.dataset.path.split(".")[1]);
    workingData.groups[gi].travellers=el.value.split(",").map(x=>x.trim()).filter(Boolean);markChanged()
   })
 })
}
function renderSimpleList(title,keys){
 $("#formEditor").innerHTML=(workingData||[]).map((row,i)=>`
 <article class="cms-record-card">
  <div class="cms-card-head"><h3>${title} ${i+1}</h3><button class="admin-danger small-action" data-action="delete-record" data-index="${i}">Hapus</button></div>
  <div class="cms-grid two">
   ${keys.map(k=>field(k,row[k]??"",`${i}.${k}`,k==="member"?"number":"text")).join("")}
  </div>
 </article>`).join("")+`<button class="admin-primary" data-action="add-record">+ Tambah ${title}</button>`;
}
function renderRooms(){
 $("#formEditor").innerHTML=(workingData.regions||[]).map((region,ri)=>`
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
   const p=el.dataset.path.split(".");workingData.regions[+p[1]].rooms[+p[3]].members=el.value.split(",").map(x=>x.trim()).filter(Boolean);markChanged()
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
  el.addEventListener("input",()=>{const i=+el.dataset.path.split(".")[0];workingData[i].items=el.value.split("\n").map(x=>x.trim()).filter(Boolean);markChanged()})
 })
}
function handleAction(e){
 const a=e.currentTarget.dataset.action;
 if(a==="add-day"){workingData.days.push({date:"2027-03-15",label:"Hari Baru",items:[]})}
 if(a==="delete-day"){if(confirm("Hapus hari ini?"))workingData.days.splice(+e.currentTarget.dataset.day,1)}
 if(a==="add-item"){workingData.days[+e.currentTarget.dataset.day].items.push({from:"09:00",to:"10:00",activity:"Aktivitas baru",baiduMap:false,route:{originZh:"",destinationZh:"",regionZh:"",mode:"transit"}})}
 if(a==="delete-item"){if(confirm("Hapus aktivitas ini?"))workingData.days[+e.currentTarget.dataset.day].items.splice(+e.currentTarget.dataset.item,1)}
 if(a==="add-record"){
  const t=activeDataset.type;
  if(t==="hotels")workingData.push({city:"",name:"",dates:"",address:"",mapsQuery:""});
  if(t==="hsr")workingData.push({route:"",date:"",train:"",time:"",station:"",group:""});
  if(t==="members")workingData.push({id:"",name:"",email:"",member:workingData.length+1,room:"",roommates:"",flightGroup:"group-b",seat:"",itineraryGroup:"main-group"});
  if(t==="tripinfo")workingData.push({title:"Informasi Baru",icon:"ℹ️",items:[]})
 }
 if(a==="delete-record"){if(confirm("Hapus data ini?"))workingData.splice(+e.currentTarget.dataset.index,1)}
 if(a==="add-region")workingData.regions.push({id:"kota-baru",name:"Kota Baru",rooms:[]})
 if(a==="delete-region"){if(confirm("Hapus kota ini?"))workingData.regions.splice(+e.currentTarget.dataset.region,1)}
 if(a==="add-room")workingData.regions[+e.currentTarget.dataset.region].rooms.push({room:"Kamar Baru",members:[]})
 if(a==="delete-room"){if(confirm("Hapus kamar ini?"))workingData.regions[+e.currentTarget.dataset.region].rooms.splice(+e.currentTarget.dataset.room,1)}
 renderEditor();markChanged()
}
function saveCurrent(){
 // Remove helper route objects when Baidu Map is disabled only if empty
 if(activeDataset.type==="itinerary"){
  workingData.days.forEach(d=>d.items.forEach(it=>{
   if(!it.baiduMap && it.route && !Object.values(it.route).some(Boolean))delete it.route
  }))
 }
 localStorage.setItem(STORAGE_PREFIX+activeDataset.path,JSON.stringify(workingData));
 setStatus("Tersimpan")
}
function resetCurrent(){
 if(!confirm("Reset bagian ini ke data bawaan?"))return;
 localStorage.removeItem(STORAGE_PREFIX+activeDataset.path);selectDataset(activeDataset.id)
}
async function exportAll(){
 const payload={app:"China Trip 2027",version:21,exportedAt:new Date().toISOString(),data:{}};
 DATASETS.forEach(d=>payload.data[d.path]=currentData(d.path));
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="china-trip-2027-admin-backup.json";a.click();URL.revokeObjectURL(url)
}
async function importBackup(file){
 try{
  const p=JSON.parse(await file.text());
  if(!p.data)throw new Error("File backup tidak dikenali");
  let n=0;DATASETS.forEach(d=>{if(p.data[d.path]){localStorage.setItem(STORAGE_PREFIX+d.path,JSON.stringify(p.data[d.path]));n++}});
  alert(n+" bagian data berhasil diimpor.");selectDataset(activeDataset.id)
 }catch(e){alert("Import gagal: "+e.message)}
}
function resetAll(){
 if(!confirm("Hapus seluruh perubahan admin di perangkat ini?"))return;
 DATASETS.forEach(d=>localStorage.removeItem(STORAGE_PREFIX+d.path));selectDataset(activeDataset.id)
}

$("#loginForm").addEventListener("submit",e=>{e.preventDefault();if($("#adminPassword").value===getAdminPassword()){sessionStorage.setItem(SESSION_KEY,"1");showAdmin()}else $("#loginError").hidden=false});
$("#logoutBtn").onclick=()=>{sessionStorage.removeItem(SESSION_KEY);location.reload()};
$("#saveBtn").onclick=saveCurrent;
$("#reloadBtn").onclick=()=>selectDataset(activeDataset.id);
$("#resetCurrentBtn").onclick=resetCurrent;
$("#exportBtn").onclick=exportAll;
$("#importInput").onchange=e=>{const f=e.target.files?.[0];if(f)importBackup(f);e.target.value=""};
$("#resetAllBtn").onclick=resetAll;
if(sessionStorage.getItem(SESSION_KEY)==="1")showAdmin();
