gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', () => {
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

  /**

   * Управляет поведением хэдера.

   */

  (function () {

    const html = document.documentElement;

    const header = document.getElementById('header');

    const footer = document.getElementById('footer');

    const firstHeight = 10;

  

    let startScrollTop = null; // Первоначальная позиция до начала скролла

    let fixedClassTimeout = null; // Таймер остановки скролла

  

    const scrollPosition = () => window.pageYOffset || html.scrollTop;

  

    const footerObserver = new IntersectionObserver(([entry]) => {

      html.classList.toggle('footer-show', entry.isIntersecting);

    });

    footerObserver.observe(footer);

  

    if (startScrollTop === null) {

      startScrollTop = scrollPosition();

    }

  

    window.addEventListener('scroll', () => {

  

      clearTimeout(fixedClassTimeout);

  

      fixedClassTimeout = setTimeout(() => {

        const currentScroll = scrollPosition();

  

        if (currentScroll > startScrollTop && currentScroll > firstHeight) {

          if (!html.classList.contains('header-fixed')) {

            html.classList.add('header-fixed');

          }

        } else {

          if (html.classList.contains('header-fixed')) {

            html.classList.remove('header-fixed');

          }

        }

  

        startScrollTop = null;

      }, 0);

    }, { passive: true });

  })();
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

  // Анимации

  /**

   * Анимация блоков

   */

  (function () {

    const isMobile = window.innerWidth < 600;

  

    if (!isMobile) {

      const animItems = document.querySelectorAll('.anim-items')

      animItems.forEach(items => {

        const item = items.querySelectorAll('.anim-item')

        gsap.from(item, {

          scale: 0.8,

          opacity: 0,

  

          stagger: {

            each: 0.3, // задержка между каждым айтемом

            from: "start"

          },

  

          duration: 1,

          ease: "back.out(1.7)",

  

          scrollTrigger: {

            trigger: items,

            start: "top 50%",

            onEnter: () => items.classList.add('anim-animated'),

          }

        });

      });

    }

  })();

  

  (function () {

    const isMobile = window.innerWidth < 600;

    if (isMobile) return;

  

    const animBlocks = document.querySelectorAll('.anim-block');

    if (!animBlocks.length) return;

  

    animBlocks.forEach(block => {

      gsap.fromTo(block,

        {

          y: 200,

          opacity: 0.1

        },

        {

          y: 0,

          opacity: 1,

          duration: 0.8,

          ease: "power2.out",

          scrollTrigger: {

            trigger: block,

            start: "top 95%",

            toggleActions: "play none none none"

          }

        }

      );

    });

  })();

  

  (function () {

    const isMobile = window.innerWidth < 600;

    if (isMobile) return;

  

    const parallaxContainers = document.querySelectorAll('.parallax-container');

    if (!parallaxContainers.length) return;

  

    parallaxContainers.forEach(container => {

      const img = container.querySelector('img');

      if (!img) return;

  

      gsap.fromTo(img,

        {

          yPercent: -10,

          scale: 1.1

        },

        {

          yPercent: 10,

          scale: 1.1,

          ease: "none",

          scrollTrigger: {

            trigger: container,

            start: "top bottom",

            end: "bottom top",

            scrub: true

          }

        }

      );

    });

  })();

  
  (function () {
    gsap.utils.toArray('[data-split="lines"]').forEach(container => {
      const targets = container.querySelectorAll('h1, h2, p');
      if (!targets.length) return;
  
      const isMobile = window.innerWidth < 600;
  
      gsap.fromTo(targets,
        {
          '--reveal-progress': '0%',
          y: '2.5rem',
          rotateX: -6,
          transformOrigin: 'top center'
        },
        {
          '--reveal-progress': '130%',
          y: '0rem',
          rotateX: 0,
          duration: isMobile ? 0.6 : 1.4,
          stagger: isMobile ? 0.12 : 0.22,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 90%',
            end: 'bottom top',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  })();
  
  gsap.utils.toArray('[data-split="text"]').forEach(dataSplitText => {
    const isMobile = window.innerWidth < 600;
    const textSplit = dataSplitText.querySelectorAll('*');
    if (textSplit && !isMobile) SplitText.create(textSplit, {
      type: "words",
      aria: "hidden",
      onSplit: split => gsap.from(split.words, {
        opacity: 0,
        // duration: 0.3,
        duration: isMobile ? 0.2 : 0.5,
        // stagger: 0.05,
        stagger: isMobile ? 0.03 : 0.08,
        ease: "sine.out",
        scrollTrigger: {
          trigger: dataSplitText,
          start: "top 95%",
          end: "bottom top",
        }
      })
    });
  });

  // Функция магнитизма кнопок к курсору

  (function () {

    const magneticButtons = document.querySelectorAll('.magnetic');

    if (!magneticButtons.length) return;

  

    const mediaQuery = window.matchMedia('(max-width: 600px)');

  

    magneticButtons.forEach((button) => {

      const magnetic__hit = button.querySelector('.magnetic__hit');

      const magnetic_inner = button.querySelector('.magnetic__inner');

      const magnetic_text = button.querySelector('.magnetic__text');

  

      if (!magnetic__hit || !magnetic_inner) return;

  

      let isFirstEnter = false;

  

      const handleMouseEnter = () => {

        if (mediaQuery.matches) return;

        isFirstEnter = true;

      };

  

      // Функция ведения магнита за курсором

      const handleMouseMove = (e) => {

        if (mediaQuery.matches) return;

  

        const position = button.getBoundingClientRect();

  

        const x = e.clientX - (position.left + position.width / 2);

        const y = e.clientY - (position.top + position.height / 2);

  

        const currentDuration = isFirstEnter ? 1.2 : 0.8;

        const currentEase = isFirstEnter ? "power2.out" : "power3.out";

  

        gsap.to(magnetic_inner, {

          x: x * 0.3,

          y: y * 0.4,

          duration: currentDuration,

          ease: currentEase,

          overwrite: "auto",

          onStart: () => {

            isFirstEnter = false;

          }

        });

  

        if (magnetic_text) {

          gsap.to(magnetic_text, {

            x: x * 0.12,

            y: y * 0.15,

            scale: 1.05,

            duration: currentDuration,

            ease: currentEase,

            overwrite: "auto"

          });

        }

      };

  

      const handleMouseLeave = () => {

        if (mediaQuery.matches) return;

  

        gsap.to(magnetic_inner, {

          x: 0,

          y: 0,

          duration: 0.8,

          ease: "elastic.out(1, 0.5)",

          overwrite: "auto"

        });

  

        if (magnetic_text) {

          gsap.to(magnetic_text, {

            x: 0,

            y: 0,

            scale: 1,

            duration: 0.8,

            ease: "elastic.out(1, 0.5)",

            overwrite: "auto"

          });

        }

      };

  

      magnetic__hit.addEventListener('mouseenter', handleMouseEnter);

      magnetic__hit.addEventListener('mousemove', handleMouseMove);

      magnetic__hit.addEventListener('mouseleave', handleMouseLeave);

  

      const handleReset = (e) => {

        if (e.matches) {

          gsap.killTweensOf([magnetic_inner, magnetic_text]);

          if (magnetic_inner) magnetic_inner.style.transform = '';

          if (magnetic_text) magnetic_text.style.transform = '';

        }

      };

  

      try {

        mediaQuery.addEventListener('change', handleReset);

      } catch (err) {

        mediaQuery.addListener(handleReset);

      }

    });

  })();

  // Слайдеры

  function initClipSlider(selector, contentSelector, options = {}) {

    const container = document.querySelector(selector);

    if (!container) return null;

  

    const config = Object.assign({

      pagination: '.swiper-pagination',

      btnNext: '.swiper-button-next',

      btnPrev: '.swiper-button-prev',

      bulletClass: 'swiper-pagination-bullet',

      activeClass: 's--active',

      prevClass: 's--prev'

    }, options);

  

    const paginationEl =

      container.querySelector(config.pagination) ||

      document.querySelector(config.pagination);

  

    const swiper = new Swiper(selector, {

      slidesPerView: 1,

      loop: false,

      speed: 0,

      grabCursor: true,

      allowTouchMove: false,

      init: true,

      pagination: {

        el: paginationEl,

        type: 'fraction',

        formatFractionCurrent: (number) => String(number).padStart(2, '0'),

        formatFractionTotal: (number) => String(number).padStart(2, ''),

        renderFraction: function (currentClass, totalClass) {

          return '<span class="' + currentClass + '"></span>' +

            '<span class="swiper-pagination-divider">/</span>' +

            '<span class="' + totalClass + '"></span>';

        }

      }

    });

  

    const hasContent = contentSelector && typeof contentSelector === 'string';

    const contentContainer = hasContent ? document.querySelector(contentSelector) : null;

    let contentSwiper = null;

  

    if (contentContainer) {

      contentSwiper = new Swiper(contentSelector, {

        slidesPerView: 1,

        loop: false,

        speed: 800,

        allowTouchMove: false,

        init: false,

        effect: 'fade',

        fadeEffect: {

          crossFade: true,

        },

      });

    }

  

    const total = () => swiper.slides.length;

    let prevIndex = 0;

    let blocked = false;

    const DURATION = 800;

  

    swiper.on('slideChange', () => {

      if (contentSwiper) {

        contentSwiper.slideTo(swiper.activeIndex, 800);

      }

      animate(prevIndex, swiper.activeIndex);

      prevIndex = swiper.activeIndex;

    });

  

    function goTo(index) {

      if (blocked) return;

      const to = ((index % total()) + total()) % total();

      if (to === swiper.activeIndex) return;

      blocked = true;

      setTimeout(() => { blocked = false; }, DURATION);

  

      swiper.slideTo(to, 0);

    }

  

    function go(isRight) {

      goTo(swiper.activeIndex + (isRight ? 1 : -1));

    }

  

    function animate(from, to) {

      if (from === to) return;

      const isRight = to > from || (from === total() - 1 && to === 0);

      const cur = swiper.slides[from];

      const next = swiper.slides[to];

      if (!cur || !next) return;

  

      cur.classList.remove(config.activeClass, `${config.activeClass}-prev`);

  

      const nextImg = next.querySelector('img');

      if (nextImg) {

        nextImg.style.transition = 'none';

        nextImg.style.transform = 'scale(1.3)';

        nextImg.getBoundingClientRect();

      }

  

      next.classList.add(config.activeClass);

      if (!isRight) next.classList.add(`${config.activeClass}-prev`);

  

      requestAnimationFrame(() => requestAnimationFrame(() => {

        if (nextImg) {

          nextImg.style.transition = 'transform 0.8s ease';

          nextImg.style.transform = 'scale(1)';

        }

      }));

  

      const curImg = cur.querySelector('img');

      if (curImg) {

        curImg.style.transition = 'transform 0.2s ease';

        curImg.style.transform = 'scale(1)';

      }

  

      container.querySelector(`.swiper-slide.${config.prevClass}`)?.classList.remove(config.prevClass);

      let prev = to - 1;

      if (prev < 0) prev = total() - 1;

      if (swiper.slides[prev]) {

        swiper.slides[prev].getClientRects();

        swiper.slides[prev].classList.add(config.prevClass);

      }

    }

  

    let startX = null;

    const THRESHOLD = 40; // Слегка уменьшили порог для более отзывчивого свайпа

  

    const swipeStart = (clientX) => {

      startX = clientX;

    };

  

    const swipeEnd = (clientX) => {

      if (startX !== null) {

        const dx = clientX - startX;

        if (Math.abs(dx) >= THRESHOLD) {

          go(dx < 0);

        }

      }

      startX = null;

    };

  

    container.addEventListener('mousedown', e => {

      if (e.button !== 0) return;

      swipeStart(e.clientX);

    }, { passive: true });

  

    window.addEventListener('mouseup', e => {

      swipeEnd(e.clientX);

    }, { passive: true });

  

    container.addEventListener('touchstart', e => {

      if (e.touches && e.touches[0]) {

        swipeStart(e.touches[0].clientX);

      }

    }, { passive: true });

  

    container.addEventListener('touchend', e => {

      if (e.changedTouches && e.changedTouches[0]) {

        swipeEnd(e.changedTouches[0].clientX);

      }

    }, { passive: true });

  

    document.querySelector(config.btnNext)?.addEventListener('click', () => go(true));

    document.querySelector(config.btnPrev)?.addEventListener('click', () => go(false));

  

    if (swiper.slides && swiper.slides[0]) {

      swiper.slides[0].classList.add(config.activeClass);

    }

    if (swiper.slides && swiper.slides[total() - 1]) {

      swiper.slides[total() - 1].classList.add(config.prevClass);

    }

  

    if (contentSwiper) {

      contentSwiper.init();

    }

  

    return swiper;

  }

  

  if (document.querySelector('.about__cover-slider')) {

    initClipSlider('.about__cover-slider', '.about__content-slider', {

      pagination: '.about-swiper-pagination',

      btnNext: '.about-button-next',

      btnPrev: '.about-button-prev'

    });

  }

  

  if (document.querySelector('.gallery__slider')) {

    initClipSlider('.gallery__slider', null, {

      pagination: '.gallery-swiper-pagination',

      btnNext: '.gallery-button-next',

      btnPrev: '.gallery-button-prev'

    });

  }
  var afishaSlider = new Swiper('.afisha__slider', {
    slidesPerGroup: 1,
    slidesPerView: 1,
    spaceBetween: 20,
    centeredSlides: true,
    grabCursor: true,
    loop: true,
    slideToClickedSlide: true,
    watchSlidesProgress: true,
    speed: 800,
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      // depth: 430,
      modifier: 1,
      // scale: 0.73,
      scale: 0.8575,
      slideShadows: false,
    },
    breakpoints: {
      835: {
        slidesPerView: 'auto',
        spaceBetween: 157,
      },
    },
    navigation: {
      nextEl: '.afisha-button-next',
      prevEl: '.afisha-button-prev',
    },
  });

  // 
  
  /**
  
   * Функция для присвоения класса filled для заполненных форм
  
   */
  
  (function () {
  
  
  
    const form = document.querySelector('form');
  
  
  
    if (form) {
  
      const inputElements = document.querySelectorAll('.form-input');
  
      const textareaElements = document.querySelectorAll('.form-textarea');
  
      const className = 'filled';
  
  
  
      inputElements.forEach(element => {
  
        element.addEventListener('input', function () {
  
          if (this.value.trim() !== '') {
  
            element.classList.add(className);
  
          } else {
  
            element.classList.remove(className);
  
          }
  
        });
  
      });
  
  
  
      textareaElements.forEach(element => {
  
        element.addEventListener('input', function () {
  
          if (this.value.trim() !== '') {
  
            element.classList.add(className);
  
          } else {
  
            element.classList.remove(className);
  
          }
  
        });
  
      });
  
    }
  
  
  
  })();

  function stickyReveal() {

    let resizeHandler = null;

    let destroyed = false;

    let items = [];

  

    const MOBILE_BREAKPOINT = 600;

  

    function applyStickyStyles() {

      if (destroyed || window.innerWidth > MOBILE_BREAKPOINT) return;

  

      items.forEach((item, index) => {

        // Раздаем инлайновый top для каждого айтема: шапка + базовый отступ 2rem + каскадный шаг 16rem

        item.style.position = 'sticky';

        item.style.top = `calc(var(--header-height) + 2rem + (${16 * index}rem))`;

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

  

  // Попап
  
  (function () {
  
    const showClass = 'popup--show';
  
  
  
    document.addEventListener('click', (e) => {
  
      const trigger = e.target.closest('[data-popup]');
  
  
  
      if (trigger) {
  
        if (e.target.closest('a') || e.target.closest('button')) {
  
          if (!trigger.hasAttribute('href')) e.preventDefault();
  
        }
  
  
  
        const popupId = trigger.dataset.popup;
  
        const targetPopup = document.getElementById(popupId);
  
  
  
        if (targetPopup) {
  
          targetPopup.classList.add(showClass);
  
          if (typeof lenis !== 'undefined') lenis.stop();
  
        }
  
        return;
  
      }
  
  
  
      const closeBtn = e.target.closest('.popup__close');
  
      if (closeBtn) {
  
        const activePopup = closeBtn.closest('.popup');
  
        if (activePopup) {
  
          activePopup.classList.remove(showClass);
  
          if (typeof lenis !== 'undefined') lenis.start();
  
        }
  
        return;
  
      }
  
  
  
      const overlayPopup = e.target.closest('.popup');
  
      if (overlayPopup) {
  
        const isInsideContent = e.target.closest('.popup__wrap');
  
        if (!isInsideContent) {
  
          overlayPopup.classList.remove(showClass);
  
          if (typeof lenis !== 'undefined') lenis.start();
  
        }
  
      }
  
    });
  
  
  
    window.addEventListener('keydown', (e) => {
  
      if (e.key === 'Escape') {
  
        const activePopup = document.querySelector(`.popup.${showClass}`);
  
        if (activePopup) {
  
          activePopup.classList.remove(showClass);
  
          if (typeof lenis !== 'undefined') lenis.start();
  
        }
  
      }
  
    });
  
  })();

  (function () {

    const btnsContainer = document.querySelector('.menu__btns');

    if (!btnsContainer) return;

  

    const btns = btnsContainer.querySelectorAll('.menu__btn');

    const images = document.querySelectorAll('.menu__cover-img');

    if (!btns.length || !images.length) return;

  

    const clearActiveImages = () => {

      images.forEach(img => img.classList.remove('menu__cover-img--show'));

    };

  

    btns.forEach(btn => {

      const isBar = btn.classList.contains('menu__btn--bar');

      const isMain = btn.classList.contains('menu__btn--main');

  

      let targetSelector = '';

      if (isBar) targetSelector = '.menu__cover-img--bar';

      if (isMain) targetSelector = '.menu__cover-img--main';

  

      if (!targetSelector) return;

  

      btn.addEventListener('mouseenter', () => {

        const targetImg = document.querySelector(targetSelector);

  

        if (targetImg) {

          clearActiveImages();

          targetImg.classList.add('menu__cover-img--show');

        }

      });

    });

  })();
  /**
   * Инициализация Fancybox
   */
  Fancybox.bind('[data-fancybox]', {
    // Отключаем закрытие свайпом вниз
    dragToClose: false,
    closeExisting: true,
    // Отключаем жесты карусели (свайп влево/вправо)
    Carousel: {
      Panzoom: {
        // Отключаем pan (перетаскивание контента)
        panMode: 'mousemove',
        // или полностью:
        // touch: false,
      },
    },
    on: {
      init: () => lenis.stop(),
      destroy: () => lenis.start(),
    },
  });

  window.addEventListener('resize', function () { ScrollTrigger.update() });
});