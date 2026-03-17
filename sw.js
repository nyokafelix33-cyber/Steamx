// Feng World Service Worker with Ad Blocking
var AD_DOMAINS = [
  'doubleclick.net','googlesyndication.com','adservice.google','adskeeper.co.uk',
  'adnxs.com','adsrvr.org','popads.net','popcash.net','propellerads.com',
  'trafficjunky.net','exoclick.com','juicyads.com','revcontent.com',
  'mgid.com','taboola.com','outbrain.com','adsterra.com','hilltopads.net',
  'clickadu.com','pushground.com','richpush.co','evadav.com','galaksion.com',
  'monetag.com','a-ads.com','admaven.com','adcash.com','bidvertiser.com',
  'clickaine.com','onclicka.com','cpalead.com','cpagrip.com',
  'popunder.net','roller-ads.com','trackvoluum.com',
  'go.onclasrv.com','onclkds.com','tsyndicate.com','tstrck.com',
  'syndication.realsrv','ad-maven.com','ad-score.com','smartadserver.com',
  'serving-sys.com','moatads.com','zedo.com','undertone.com',
  'bongacams.com','chaturbate.com','stripchat.com','livejasmin.com',
  'cam4.com','istripper.com','dating.com',
  'bet365.com','1xbet.com','betway.com'
];

function isAdRequest(url) {
  if (!url) return false;
  var u = url.toLowerCase();
  return AD_DOMAINS.some(function(d) { return u.indexOf(d) >= 0; });
}

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open('feng-v2').then(function(c) {
    return c.addAll(['./']);
  }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== 'feng-v2'; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Block ad requests with an empty response
  if (isAdRequest(url)) {
    e.respondWith(new Response('', {
      status: 200,
      statusText: 'Blocked',
      headers: { 'Content-Type': 'text/plain' }
    }));
    return;
  }

  // Normal caching strategy for everything else
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(response) {
        // Only cache same-origin GET requests
        if (e.request.method === 'GET' && url.indexOf(self.location.origin) === 0) {
          var responseClone = response.clone();
          caches.open('feng-v2').then(function(cache) {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
