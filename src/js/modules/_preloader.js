/**
 * Прелоадер + якорь + инициализация Lenis
 */
(function () {
  const MENU_CLOSE_DURATION = 800;

  const LenisClass = window.Lenis;
  if (!LenisClass) return;

  const lenis = new LenisClass();
  window.lenis = lenis;

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    lenis.scrollTo(target, {
      offset: -100,
      duration: 1.5,
    });
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    if (link.hasAttribute('data-fancybox')) return;

    const href = link.getAttribute('href');
    if (!href || !href.includes('#')) return;

    const hash = href.split('#')[1];
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    e.preventDefault();

    const isMenuOpen = document.documentElement.classList.contains('menu--open');

    if (isMenuOpen) {
      lenis.stop();
      setTimeout(() => {
        lenis.start();
        scrollToTarget(target);
      }, MENU_CLOSE_DURATION);
    } else {
      scrollToTarget(target);
    }
  }, true);

  function handleInitialHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    window.scrollTo(0, 0);
    scrollToTarget(target);
  }

  if (document.readyState === 'complete') {
    handleInitialHash();
  } else {
    window.addEventListener('load', handleInitialHash);
  }
})();