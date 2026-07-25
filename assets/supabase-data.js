
(function(){
 const cfg=window.CHINA_TRIP_SUPABASE||{};
 const pathToKey={
  "data/itinerary-group-a-early.json":"itinerary_group_a_early",
  "data/itinerary-group-b-early.json":"itinerary_group_b_early",
  "data/itinerary-common.json":"itinerary_common",
  "data/flights.json":"flights",
  "data/hotels.json":"hotels",
  "data/hsr.json":"hsr",
  "data/members.json":"members",
  "data/room-groups.json":"room_groups",
  "data/trip-info.json":"trip_info"
 };
 const sessionKey="china_trip_supabase_session";
 const cachePrefix="china_trip_supabase_cache:";

 function headers(token){
  const h={apikey:cfg.publishableKey,"Content-Type":"application/json"};
  if(token)h.Authorization="Bearer "+token;
  return h;
 }
 async function request(url,options={}){
  const r=await fetch(url,options);
  const txt=await r.text();
  let body=null;
  try{body=txt?JSON.parse(txt):null}catch(e){body=txt}
  if(!r.ok)throw new Error(body?.msg||body?.message||body?.error_description||body?.hint||("HTTP "+r.status));
  return body;
 }
 async function readKey(key){
  const url=`${cfg.url}/rest/v1/app_data?data_key=eq.${encodeURIComponent(key)}&select=data_value,updated_at&limit=1`;
  const rows=await request(url,{headers:headers()});
  if(!rows?.length)throw new Error("Dataset tidak ditemukan: "+key);
  localStorage.setItem(cachePrefix+key,JSON.stringify(rows[0].data_value));
  return rows[0].data_value;
 }
 async function readPath(path){
  const key=pathToKey[path];
  if(!key)return null;
  try{return await readKey(key)}
  catch(err){
   console.warn("Supabase read failed, using cache/local file",key,err);
   const cached=localStorage.getItem(cachePrefix+key);
   if(cached){try{return JSON.parse(cached)}catch(e){}}
   return null;
  }
 }
 function getSession(){
  try{return JSON.parse(localStorage.getItem(sessionKey)||"null")}catch(e){return null}
 }
 function saveSession(session){
  localStorage.setItem(sessionKey,JSON.stringify(session));
  return session;
 }
 function clearSession(){localStorage.removeItem(sessionKey)}
 async function login(email,password){
  const body=await request(`${cfg.url}/auth/v1/token?grant_type=password`,{
   method:"POST",headers:headers(),body:JSON.stringify({email,password})
  });
  return saveSession(body);
 }
 async function refreshSession(){
  const s=getSession();
  if(!s?.refresh_token)throw new Error("Sesi admin tidak tersedia");
  const body=await request(`${cfg.url}/auth/v1/token?grant_type=refresh_token`,{
   method:"POST",headers:headers(),body:JSON.stringify({refresh_token:s.refresh_token})
  });
  return saveSession(body);
 }
 async function validSession(){
  let s=getSession();
  if(!s?.access_token)return null;
  const expiresAt=(s.expires_at||0)*1000;
  if(expiresAt && expiresAt-Date.now()<60000){
   try{s=await refreshSession()}catch(e){clearSession();return null}
  }
  return s;
 }
 async function writeKey(key,value,description){
  let s=await validSession();
  if(!s)throw new Error("Sesi admin berakhir. Silakan login kembali.");
  const payload=[{data_key:key,data_value:value,description:description||null}];
  try{
   const result=await request(`${cfg.url}/rest/v1/app_data?on_conflict=data_key`,{
    method:"POST",
    headers:{...headers(s.access_token),Prefer:"resolution=merge-duplicates,return=representation"},
    body:JSON.stringify(payload)
   });
   localStorage.setItem(cachePrefix+key,JSON.stringify(value));
   return result;
  }catch(err){
   if(/jwt|token|expired/i.test(err.message)){
    s=await refreshSession();
    return request(`${cfg.url}/rest/v1/app_data?on_conflict=data_key`,{
     method:"POST",
     headers:{...headers(s.access_token),Prefer:"resolution=merge-duplicates,return=representation"},
     body:JSON.stringify(payload)
    });
   }
   throw err;
  }
 }
 async function signOut(){
  const s=getSession();
  if(s?.access_token){
   try{await request(`${cfg.url}/auth/v1/logout`,{method:"POST",headers:headers(s.access_token)})}catch(e){}
  }
  clearSession();
 }
 window.ChinaTripDB={
  pathToKey,readKey,readPath,writeKey,login,signOut,getSession,validSession,clearSession
 };
})();
