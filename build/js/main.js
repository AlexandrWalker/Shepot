gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Прелоадер + якорь + инициализация Lenis
   */
  // Блокируем браузерное восстановление скролла до того как браузер успеет прыгнуть к якорю
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  
  (function () {
  
    // Длительность анимации закрытия мобильного меню в миллисекундах
    const MENU_CLOSE_DURATION = 400;
  
    // Конфигурация прелоадера
    const PRELOADER_CONFIG = {
      mode: 'overlay',
      assets: {
        logoWhiteSrc: './images/logo/logo.svg',
        logoCyanSrc: './images/logo/logo-red.svg',
      },
      logoWidth: 472,
      logoHeight: 60,
      safetyTimeoutMs: 8000,
      overlayHideDelayMs: 600,
    };
  
    // Инициализация Lenis и привязка к GSAP ticker
    const lenis = new Lenis();
    window.lenis = lenis;
  
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  
    // Плавный скролл к целевому элементу через Lenis
    function scrollToTarget(target) {
      lenis.scrollTo(target, {
        // offset: -60,
        // offset: -150,
        offset: -190,
        duration: 1.5,
      });
    }
  
    // Возвращает промис который резолвится когда прелоадер скрыт
    // Используем MutationObserver чтобы отследить удаление класса preloader--active
    function waitForPreloader() {
      return new Promise((resolve) => {
        if (!document.documentElement.classList.contains('preloader--active')) {
          resolve();
          return;
        }
  
        const observer = new MutationObserver(() => {
          if (!document.documentElement.classList.contains('preloader--active')) {
            observer.disconnect();
            resolve();
          }
        });
  
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });
      });
    }
  
    // Обработчик кликов по якорным ссылкам
    // capture: true позволяет перехватить событие раньше stopPropagation в меню
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
  
      // Не мешаем Fancybox — пропускаем ссылки с data-fancybox
      if (link.hasAttribute('data-fancybox')) return;
  
      const href = link.getAttribute('href');
      if (!href || !href.includes('#')) return;
  
      const hash = href.split('#')[1];
      if (!hash) return;
  
      // Ищем элемент на текущей странице
      // Если его нет — браузер сам перейдёт на нужную страницу
      // После загрузки сработает обработчик load ниже
      const target = document.getElementById(hash);
      if (!target) return;
  
      e.preventDefault();
      history.pushState(null, null, `#${hash}`);
  
      const isMenuOpen = document.documentElement.classList.contains('menu--open');
  
      if (isMenuOpen) {
        // Останавливаем Lenis пока меню закрывается анимацией
        lenis.stop();
        setTimeout(() => {
          lenis.start();
          scrollToTarget(target);
        }, MENU_CLOSE_DURATION);
      } else {
        scrollToTarget(target);
      }
  
    }, true);
  
    // При загрузке страницы с якорем в URL
    // Сначала сбрасываем позицию чтобы браузер не прыгал сам
    // Потом ждём конца прелоадера и плавно скроллим
    window.addEventListener('load', () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
  
      const target = document.getElementById(hash);
      if (!target) return;
  
      window.scrollTo(0, 0);
  
      waitForPreloader().then(() => scrollToTarget(target));
    });
  
    // Инициализация прелоадера
    const preloaderEl = document.querySelector('.preloader');
    if (!preloaderEl) return;
  
    // Блокируем скролл страницы пока прелоадер активен
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('preloader--active');
  
    // Страховочный таймер на случай если что-то пошло не так
    // Принудительно скрывает прелоадер через safetyTimeoutMs миллисекунд
    const safetyTimer = setTimeout(() => {
      if (preloaderEl.style.display !== 'none') {
        preloaderEl.style.display = 'none';
        restoreScroll();
      }
    }, PRELOADER_CONFIG.safetyTimeoutMs);
  
    function restoreScroll() {
      document.body.classList.remove('no-scroll');
    }
  
    function clearSafety() {
      try { clearTimeout(safetyTimer); } catch (e) { }
    }
  
    const canvas = document.getElementById('logo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
  
    // Настраиваем canvas с учётом плотности пикселей экрана
    function initCanvas() {
      const { logoWidth, logoHeight } = PRELOADER_CONFIG;
      const dpr = window.devicePixelRatio || 1;
  
      canvas.width = logoWidth * dpr;
      canvas.height = logoHeight * dpr;
  
      if (ctx.setTransform) ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
  
      return { logoWidth, logoHeight };
    }
  
    // Скрываем прелоадер с анимацией схлопывания
    // После завершения анимации удаляем класс preloader--active с html
    function hidePreloader() {
      gsap.set(canvas, { opacity: 0 });
  
      gsap.to(preloaderEl, {
        scaleY: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        transformOrigin: 'top center',
        onComplete() {
          preloaderEl.style.display = 'none';
          restoreScroll();
          clearSafety();
          document.documentElement.classList.remove('preloader--active');
        },
      });
  
      gsap.to(canvas, {
        scaleY: 2,
        duration: 0.7,
        ease: 'power2.inOut',
        transformOrigin: 'bottom center',
      });
    }
  
    // Режим overlay — два логотипа с анимацией заливки снизу вверх
    function startOverlayPreloader() {
      const { logoWidth, logoHeight } = initCanvas();
      let fillHeight = 0;
  
      const logoWhite = new Image();
      const logoCyan = new Image();
      let loadedCount = 0;
  
      function draw() {
        ctx.clearRect(0, 0, logoWidth, logoHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(logoWhite, 0, 0, logoWidth, logoHeight);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = '#DC2340';
        ctx.fillRect(0, logoHeight - fillHeight, logoWidth, fillHeight);
        ctx.globalCompositeOperation = 'source-over';
      }
  
      function onImageLoaded() {
        loadedCount++;
        if (loadedCount === 2) startAnimation();
      }
  
      logoWhite.onload = logoWhite.onerror = onImageLoaded;
      logoCyan.onload = logoCyan.onerror = onImageLoaded;
      logoWhite.src = PRELOADER_CONFIG.assets.logoWhiteSrc;
      logoCyan.src = PRELOADER_CONFIG.assets.logoCyanSrc;
  
      function startAnimation() {
        draw();
  
        const progress = { val: 0 };
  
        // Быстрый старт до 30%
        gsap.to(progress, {
          val: 30,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate() {
            fillHeight = (progress.val / 100) * logoHeight;
            draw();
          },
        });
  
        // Медленное движение до 85% пока грузится страница
        gsap.to(progress, {
          val: 85,
          duration: 2.5,
          ease: 'power1.out',
          delay: 0.4,
          onUpdate() {
            fillHeight = (progress.val / 100) * logoHeight;
            draw();
          },
        });
  
        // После полной загрузки страницы добиваем до 100% и скрываем
        window.addEventListener('load', function onLoad() {
          window.removeEventListener('load', onLoad);
          gsap.killTweensOf(progress);
  
          gsap.to(progress, {
            val: 100,
            duration: 0.4,
            ease: 'power2.out',
            onUpdate() {
              fillHeight = (progress.val / 100) * logoHeight;
              draw();
            },
            onComplete() {
              setTimeout(hidePreloader, PRELOADER_CONFIG.overlayHideDelayMs);
            },
          });
        });
      }
    }
  
    // Режим singleLogo — одно лого без заливки, скрывается после загрузки
    function startSingleLogoPreloader() {
      const { logoWidth, logoHeight } = initCanvas();
      const logo = new Image();
  
      function showAndWait() {
        window.addEventListener('load', function onLoad() {
          window.removeEventListener('load', onLoad);
          hidePreloader();
        });
      }
  
      logo.onload = () => {
        ctx.clearRect(0, 0, logoWidth, logoHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(logo, 0, 0, logoWidth, logoHeight);
  
        gsap.fromTo(canvas,
          { opacity: 0.2, scaleY: 0.98 },
          { opacity: 1, scaleY: 1, duration: 0.4, ease: 'power2.out' }
        );
  
        showAndWait();
      };
  
      logo.onerror = showAndWait;
      logo.src = PRELOADER_CONFIG.assets.logoWhiteSrc;
    }
  
    // Запускаем нужный режим прелоадера
    if (PRELOADER_CONFIG.mode === 'singleLogo') {
      startSingleLogoPreloader();
    } else {
      startOverlayPreloader();
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
  function initClipSlider(selector, contentSelector) {
    const container = document.querySelector(selector);
    if (!container) return null;
  
    const paginationEl =
      container.querySelector('.about-swiper-pagination') ||
      document.querySelector('.about-swiper-pagination');
  
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
  
    const contentContainer = document.querySelector(contentSelector);
    let contentSwiper = null;
  
    if (contentContainer) {
      contentSwiper = new Swiper(contentSelector, {
        slidesPerView: 1,
        loop: false,
        speed: 300,
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
    const DURATION = 500;
  
    swiper.on('slideChange', () => {
      animate(prevIndex, swiper.activeIndex);
      prevIndex = swiper.activeIndex;
    });
  
    function goTo(index) {
      if (blocked) return;
      const to = ((index % total()) + total()) % total();
      if (to === swiper.activeIndex) return;
      blocked = true;
      setTimeout(() => { blocked = false; }, DURATION);
  
      if (contentSwiper) {
        contentSwiper.slideTo(to, 300);
      }
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
  
      cur.classList.remove('s--active', 's--active-prev');
  
      const nextImg = next.querySelector('img');
      if (nextImg) {
        nextImg.style.transition = 'none';
        nextImg.style.transform = 'scale(1.3)';
        nextImg.getBoundingClientRect();
      }
  
      next.classList.add('s--active');
      if (!isRight) next.classList.add('s--active-prev');
  
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (nextImg) {
          nextImg.style.transition = 'transform 0.5s ease';
          nextImg.style.transform = 'scale(1)';
        }
      }));
  
      const curImg = cur.querySelector('img');
      if (curImg) {
        curImg.style.transition = 'transform 0.2s ease';
        curImg.style.transform = 'scale(1)';
      }
  
      container.querySelector('.swiper-slide.s--prev')?.classList.remove('s--prev');
      let prev = to - 1;
      if (prev < 0) prev = total() - 1;
      swiper.slides[prev].classList.add('s--prev');
    }
  
    let startX = null;
    const THRESHOLD = 50;
  
    container.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX;
      container.setPointerCapture?.(e.pointerId);
    }, { passive: true });
  
    container.addEventListener('pointerup', e => {
      if (startX !== null) {
        const dx = e.clientX - startX;
        if (Math.abs(dx) >= THRESHOLD) go(dx < 0);
      }
      startX = null;
    });
  
    document.querySelector('.about-button-next')?.addEventListener('click', () => go(true));
    document.querySelector('.about-button-prev')?.addEventListener('click', () => go(false));
  
    swiper.slides[0]?.classList.add('s--active');
    swiper.slides[total() - 1]?.classList.add('s--prev');
  
    if (contentSwiper) {
      contentSwiper.init();
    }
  
    return swiper;
  }
  
  if (document.querySelector('.about__cover-slider')) {
    initClipSlider('.about__cover-slider', '.about__content-slider');
  }
  var afishaSlider = new Swiper('.afisha__slider', {
    slidesPerView: 1,
    spaceBetween: 20,
    centeredSlides: true,
    grabCursor: true,
    loop: true,
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      // depth: 430,
      modifier: 1,
      scale: 0.73,
      slideShadows: false,
    },
    breakpoints: {
      835: {
        slidesPerView: 'auto',
        spaceBetween: 157,
      },
    },
  });
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
});