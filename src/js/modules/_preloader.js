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