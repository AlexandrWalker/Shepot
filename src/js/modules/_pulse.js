(function () {
  const links = document.querySelectorAll('.link');
  if (!links.length) return;

  const isMobile = () => window.innerWidth < 600;

  links.forEach(link => {
    let isHovered = false;

    link.addEventListener('mouseenter', () => {
      if (isMobile()) return;
      isHovered = true;
      link.classList.add('is-animating');
    });

    link.addEventListener('mouseleave', () => {
      if (isMobile()) return;
      isHovered = false;
    });

    link.addEventListener('animationiteration', (e) => {
      if (e.animationName === 'premiumSyncAfter' && !isHovered) {
        link.classList.remove('is-animating');
      }
    });

    link.addEventListener('touchstart', () => {
      if (!isMobile()) return;
      link.classList.add('is-clicked');
    }, { passive: true });

    link.addEventListener('animationend', (e) => {
      if (e.animationName === 'premiumSyncAfter') {
        link.classList.remove('is-clicked');
      }
    });
  });
})();