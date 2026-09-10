function stickyReveal() {
  let resizeHandler = null;
  let destroyed = false;
  let items = [];

  const MOBILE_BREAKPOINT = 600;

  function applyStickyStyles() {
    if (destroyed || window.innerWidth > MOBILE_BREAKPOINT) return;

    items.forEach((item, index) => {
      item.style.position = 'sticky';
      item.style.top = `calc(var(--header-height) + 2rem + (${14 * index}rem))`;
    });
  }

  function init() {
    if (window.innerWidth > MOBILE_BREAKPOINT) return;

    items = Array.from(document.querySelectorAll('.sticky__item'));
    if (!items.length) return;

    destroyed = false;
    applyStickyStyles();

    // Следим за ресайзом (переворот экрана смартфона)
    resizeHandler = () => {
      clearTimeout(resizeHandler._timer);
      resizeHandler._timer = setTimeout(() => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
          destroy();
        } else {
          applyStickyStyles();
        }
      }, 100);
    };

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function destroy() {
    destroyed = true;
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);

    items.forEach(el => {
      el.style.position = '';
      el.style.top = '';
    });
  }

  init();

  return {
    destroy,
    reinit: () => { destroy(); init(); }
  };
}

let globalStickyInstance = stickyReveal();