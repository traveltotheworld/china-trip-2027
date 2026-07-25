
const ADMIN_PASSWORD_DEFAULT="Admin2027!";
const STORAGE_PREFIX="china_trip_override:";
const SESSION_KEY="china_trip_admin_session";

const DATASETS=[
 {id:"itinerary-a",title:"Itinerary Grup A — 2–6 Maret",category:"Itinerary",path:"data/itinerary-group-a-early.json"},
 {id:"itinerary-b",title:"Itinerary Grup B — 6 Maret",category:"Itinerary",path:"data/itinerary-group-b-early.json"},
 {id:"itinerary-common",title:"Itinerary Bersama — 7–14 Maret",category:"Itinerary",path:"data/itinerary-common.json"},
 {id:"flights",title:"Penerbangan",category:"Transportasi",path:"data/flights.json"},
 {id:"hotels",title:"Hotel",category:"Akomodasi",path:"data/hotels.json"},
 {id:"hsr",title:"High Speed Rail",category:"Transportasi",path:"data/hsr.json"},
 {id:"members",title:"Peserta",category:"Peserta",path:"data/members.json"},
 {id:"rooms",title:"Pembagian Kamar",category:"Peserta",path:"data/room-groups.json"},
 {id:"trip-info",title:"Informasi Perjalanan",category:"Informasi",path:"data/trip-info.json"}
];

let activeDataset=DATASETS[0];
const $=s=>document.querySelector(s);

function getAdminPassword(){
 return localStorage.getItem("china_trip_admin_password")||ADMIN_PASSWORD_DEFAULT;
}

async function fetchBase(path){
 const r=await fetch(path,{cache:"no-store"});
 if(!r.ok)throw new Error("Gagal memuat "+path);
 return r.json();
}

async function getCurrent(path){
 const saved=localStorage.getItem(STORAGE_PREFIX+path);
 if(saved)return JSON.parse(saved);
 return fetchBase(path);
}

function showAdmin(){
 $("#loginPanel").hidden=true;
 $("#adminPanel").hidden=false;
 buildTabs();
 selectDataset(DATASETS[0].id);
}

function buildTabs(){
 $("#adminTabs").innerHTML=DATASETS.map(d=>
   `<button data-id="${d.id}" class="${d.id===activeDataset.id?"active":""}">
      <small>${d.category}</small><strong>${d.title}</strong>
    </button>`
 ).join("");
 $("#adminTabs").querySelectorAll("button").forEach(btn=>{
   btn.onclick=()=>selectDataset(btn.dataset.id);
 });
}

async function selectDataset(id){
 activeDataset=DATASETS.find(d=>d.id===id)||DATASETS[0];
 buildTabs();
 $("#editorCategory").textContent=activeDataset.category;
 $("#editorTitle").textContent=activeDataset.title;
 $("#editorError").hidden=true;
 try{
   const data=await getCurrent(activeDataset.path);
   $("#jsonEditor").value=JSON.stringify(data,null,2);
   setStatus(localStorage.getItem(STORAGE_PREFIX+activeDataset.path)?"Versi admin aktif":"Menggunakan data bawaan");
 }catch(e){
   showError(e.message);
 }
}

function setStatus(text){
 $("#saveStatus").textContent=text;
}

function showError(text){
 $("#editorError").textContent=text;
 $("#editorError").hidden=false;
}

function saveCurrent(){
 $("#editorError").hidden=true;
 try{
   const parsed=JSON.parse($("#jsonEditor").value);
   localStorage.setItem(STORAGE_PREFIX+activeDataset.path,JSON.stringify(parsed));
   $("#jsonEditor").value=JSON.stringify(parsed,null,2);
   setStatus("Tersimpan");
 }catch(e){
   showError("Format JSON tidak valid: "+e.message);
 }
}

async function resetCurrent(){
 if(!confirm("Reset perubahan pada bagian ini dan kembali ke data bawaan?"))return;
 localStorage.removeItem(STORAGE_PREFIX+activeDataset.path);
 await selectDataset(activeDataset.id);
}

async function exportAll(){
 const payload={
   app:"China Trip 2027",
   exportedAt:new Date().toISOString(),
   version:20,
   data:{}
 };
 for(const d of DATASETS){
   payload.data[d.path]=await getCurrent(d.path);
 }
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download="china-trip-2027-admin-backup.json";
 a.click();
 URL.revokeObjectURL(url);
}

async function importBackup(file){
 try{
   const payload=JSON.parse(await file.text());
   if(!payload.data||typeof payload.data!=="object")throw new Error("File backup tidak dikenali.");
   let count=0;
   for(const d of DATASETS){
     if(Object.prototype.hasOwnProperty.call(payload.data,d.path)){
       localStorage.setItem(STORAGE_PREFIX+d.path,JSON.stringify(payload.data[d.path]));
       count++;
     }
   }
   alert(count+" bagian data berhasil diimpor.");
   await selectDataset(activeDataset.id);
 }catch(e){
   alert("Import gagal: "+e.message);
 }
}

function resetAll(){
 if(!confirm("Hapus seluruh perubahan admin pada perangkat ini?"))return;
 DATASETS.forEach(d=>localStorage.removeItem(STORAGE_PREFIX+d.path));
 selectDataset(activeDataset.id);
}

$("#loginForm").addEventListener("submit",e=>{
 e.preventDefault();
 if($("#adminPassword").value===getAdminPassword()){
   sessionStorage.setItem(SESSION_KEY,"1");
   showAdmin();
 }else{
   $("#loginError").hidden=false;
 }
});

$("#logoutBtn").onclick=()=>{
 sessionStorage.removeItem(SESSION_KEY);
 location.reload();
};
$("#saveBtn").onclick=saveCurrent;
$("#reloadBtn").onclick=()=>selectDataset(activeDataset.id);
$("#resetCurrentBtn").onclick=resetCurrent;
$("#exportBtn").onclick=exportAll;
$("#importInput").onchange=e=>{
 const file=e.target.files?.[0];
 if(file)importBackup(file);
 e.target.value="";
};
$("#resetAllBtn").onclick=resetAll;
$("#jsonEditor").addEventListener("input",()=>setStatus("Ada perubahan belum disimpan"));

if(sessionStorage.getItem(SESSION_KEY)==="1")showAdmin();
