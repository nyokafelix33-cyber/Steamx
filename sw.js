self.addEventListener('install', (e) => {
      console.log('StreamX Service Worker Installed');
      });

      self.addEventListener('fetch', (e) => {
        // This allows the app to load from cache in the future
          e.respondWith(fetch(e.request));
          });
          
})