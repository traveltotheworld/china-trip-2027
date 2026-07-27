const CACHE="china-trip-v382-personal-first";
const ASSETS=[
  "/assets/china-trip-hero-v29.jpg",
  "/assets/supabase-data.js",
  "/assets/supabase-config.js",
  "/admin.html",
  "/assets/admin.js",
  "/assets/admin-defaults.js",
  "/data/itinerary-group-a-early.json",
  "/data/itinerary-group-b-early.json",
  "/data/itinerary-common.json",
  "/",
  "/index.html",
  "/itinerary.html",
  "/flight.html",
  "/hotel.html",
  "/hsr.html",
  "/members.html",
  "/trip-info.html",
  "/assets/style.css",
  "/assets/app.js",
  "/data/members.json",
  "/data/room-groups.json",
  "/data/trip.json",
  "/data/itinerary.json",
  "/data/itinerary-septino-lina-raelyn.json",
  "/data/flights.json",
  "/data/hotels.json",
  "/data/hsr.json",
  "/data/trip-info.json",
  "/data/locations.json"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;

  const request=event.request;
  const isNavigation=request.mode==="navigate";

  if(isNavigation){
    event.respondWith(
      fetch(request,{cache:"no-store"})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(()=>caches.match(request).then(r=>r||caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response=>{
        if(response && response.status===200){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(request))
  );
});
