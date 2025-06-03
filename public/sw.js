
// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // event.waitUntil(self.skipWaiting()); // Optional: activate new SW immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // event.waitUntil(self.clients.claim()); // Optional: take control of open clients
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received.', event);
  const title = 'ResumeMatch AI';
  let body = 'You have a new notification!';
  if (event.data) {
    try {
      const data = event.data.json(); // Attempt to parse as JSON
      body = data.body || data.message || event.data.text(); // Use body, then message, then raw text
      // title = data.title || title; // Optionally override title from push data
    } catch (e) {
      body = event.data.text(); // Fallback to plain text
    }
  }

  const options = {
    body: body,
    icon: '/icons/icon-192x192.png', // Ensure this icon exists
    badge: '/icons/icon-72x72.png',  // Ensure this icon exists
    // tag: 'resume-match-notification', // Optional: replaces existing notification with the same tag
    // renotify: true, // Optional: Vibrate/sound even if tag matches
    // data: { url: event.data ? event.data.json().url : '/' } // Example: Pass data for click action
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received.', event.notification);
  event.notification.close();

  // Example: Focus or open a window based on data in notification
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Check if the client's URL matches the one we want to open
        // This is a basic check; more sophisticated URL matching might be needed
        if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }
      // If no matching client is found, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
