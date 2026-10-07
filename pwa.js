// Do not interrupt editing or force-reload an open song when an update arrives.
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
      .catch(error => console.warn('Lyric Sync offline setup failed:', error));
  });
}
function flushSongSave() {
  clearTimeout(timer);
  save();
}
window.addEventListener('pagehide', flushSongSave);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushSongSave();
});
