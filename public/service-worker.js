self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_TIMER') {
    const { duration, nextUp } = event.data;

    setTimeout(() => {
      self.registration.showNotification('Rest time is over!', {
        body: `Time for your next set: ${nextUp}`,
        icon: '/dumbbell-icon.png', // Optional: Add an icon to your public folder
        vibrate: [200, 100, 200], // Optional: Vibrate pattern
      });
    }, duration * 1000);
  }
});
