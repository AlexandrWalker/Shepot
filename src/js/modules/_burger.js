(function () {
  const burgerBtn = document.querySelector('[data-js-burger-btn]');
  const burgerMenu = document.querySelector('[data-js-burger-menu]');
  const isMobileQuery = window.matchMedia('(max-width: 600px)');

  let menuTl = null;

  if (typeof gsap !== 'undefined') {
    menuTl = gsap.timeline({ paused: true });
    
    menuTl.fromTo([
      '.burger-menu__nav',
      '.burger-menu__contacts'
    ], 
      { 
        y: -60,
        rotateX: -4,
        opacity: 0 
      },
      { 
        y: 0, 
        rotateX: 0,
        opacity: 1, 
        duration: 1.2, 
        stagger: 0.12, 
        ease: 'power4.out',
        delay: 0.5
      }
    );
  }

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

    if (menuTl) {
      menuTl.restart();
    }
  };

  const closeBurger = () => {
    document.documentElement.classList.remove('burger-menu--open');
    if (typeof lenis !== 'undefined') lenis.start();
    document.dispatchEvent(new CustomEvent('menu:close'));
    syncBurgerBtnState();

    if (menuTl) {
      menuTl.pause(0);
    }
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