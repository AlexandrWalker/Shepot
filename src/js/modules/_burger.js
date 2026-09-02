/**
 * Функция управления поведением мобильного меню, меню-каталога и поиска.
 */
(function () {
  const burgerBtn = document.querySelector('[data-js-burger-btn]');
  const burgerMenu = document.querySelector('[data-js-burger-menu]');
  const isMobileQuery = window.matchMedia('(max-width: 600px)');

  const syncBurgerBtnState = () => {
    if (!burgerBtn) return;
    const isBurgerOpen = document.documentElement.classList.contains('burger-menu--open');

    if (isBurgerOpen) {
      burgerBtn.classList.add('burger-btn--open', 'burger-btn--active');
    } else {
      burgerBtn.classList.remove('burger-btn--open', 'burger-btn--active');
    }
  };

  const openBurger = () => {
    document.documentElement.classList.add('burger-menu--open');
    if (typeof lenis !== 'undefined') lenis.stop();
    syncBurgerBtnState();
  };

  const closeBurger = () => {
    document.documentElement.classList.remove('burger-menu--open');
    if (typeof lenis !== 'undefined') lenis.start();
    document.dispatchEvent(new CustomEvent('menu:close'));
    syncBurgerBtnState();
  };

  if (burgerBtn) {
    burgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isBurgerOpen = document.documentElement.classList.contains('burger-menu--open');

      if (isBurgerOpen) {
        closeBurger();
      } else {
        openBurger();
      }
    });
  }

  const handleBreakpointChange = () => {
    closeBurger();
  };

  try {
    isMobileQuery.addEventListener('change', handleBreakpointChange);
  } catch (err) {
    isMobileQuery.addListener(handleBreakpointChange);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      closeBurger();
    }
  });

  document.addEventListener('click', (event) => {
    const isBurgerOpen = document.documentElement.classList.contains('burger-menu--open');
    if (!isBurgerOpen) return;

    const clickInsideBurger = burgerMenu && burgerMenu.contains(event.target);
    const clickOnBurgerBtn = burgerBtn && burgerBtn.contains(event.target);
    const clickOnBurgerLink = burgerMenu && burgerMenu.contains(event.target) && event.target.tagName === 'A';

    if ((!clickInsideBurger && !clickOnBurgerBtn) || clickOnBurgerLink) {
      closeBurger();
    }
  });
})();