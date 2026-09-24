(function () {
  const videos = document.querySelectorAll('.js-autoplay-video');
  if (!videos.length) return;

  videos.forEach(video => {
    if (video.paused) {
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          document.addEventListener('touchstart', function forcePlay() {
            video.play();
            document.removeEventListener('touchstart', forcePlay);
          }, { once: true, passive: true });

          document.addEventListener('click', function forcePlayClick() {
            video.play();
            document.removeEventListener('click', forcePlayClick);
          }, { once: true, passive: true });
        });
      }
    }
  });
})();