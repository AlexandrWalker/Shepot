gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', () => {

  const checkEditMode = document.querySelector('.bx-panel-toggle-on') ?? null;

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
    const catalogMenu = document.getElementById('catalog-menu');
    const burgerBtn = document.getElementById('burger-btn');
    const burgerMenu = document.getElementById('burger-menu');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const mobileSearchMenu = document.getElementById('mobile-search-menu');

    const catalogBtns = document.querySelectorAll('.js-catalog-btn');
    const menuBlocks = catalogMenu ? catalogMenu.querySelectorAll('[data-target]') : [];
    const menuItems = catalogMenu ? catalogMenu.querySelectorAll('[data-panel]') : [];
    const blockWrappers = catalogMenu ? catalogMenu.querySelectorAll('.menu__block-wrapper') : [];
    const correspondingInner = catalogMenu ? catalogMenu.querySelector('.menu__inner') : null;

    const isMobileQuery = window.matchMedia('(max-width: 600px)');
    const observersList = [];

    const updateAllWrappersHeight = () => {
      if (blockWrappers.length === 0 || !correspondingInner) return;
      blockWrappers.forEach(wrapper => {
        if (isMobileQuery.matches) {
          wrapper.removeAttribute('style');
          return;
        }
        const innerHeight = correspondingInner.offsetHeight;
        const finalHeight = innerHeight > 0 ? innerHeight : correspondingInner.scrollHeight;
        if (finalHeight > 0) {
          wrapper.style.maxHeight = `${finalHeight}px`;
        }
      });
    };

    const initHeightTracking = () => {
      if (blockWrappers.length === 0 || !correspondingInner) return;
      if (typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', updateAllWrappersHeight);
        window.addEventListener('orientationchange', updateAllWrappersHeight);
        updateAllWrappersHeight();
        return;
      }
      blockWrappers.forEach(wrapper => {
        const observer = new ResizeObserver(() => {
          window.requestAnimationFrame(() => {
            if (isMobileQuery.matches) {
              wrapper.removeAttribute('style');
              return;
            }
            const innerHeight = correspondingInner.offsetHeight;
            const finalHeight = innerHeight > 0 ? innerHeight : correspondingInner.scrollHeight;
            if (finalHeight > 0) {
              wrapper.style.maxHeight = `${finalHeight}px`;
            }
          });
        });
        observer.observe(correspondingInner);
        observersList.push(observer);
      });
      updateAllWrappersHeight();
    };

    const syncBurgerBtnState = () => {
      if (!burgerBtn) return;
      const isAnyMenuOpen =
        document.documentElement.classList.contains('catalog-menu--open') ||
        document.documentElement.classList.contains('burger-menu--open') ||
        document.documentElement.classList.contains('mobile-search-menu--open');

      if (isAnyMenuOpen) {
        burgerBtn.classList.add('burger-btn--open');
      } else {
        burgerBtn.classList.remove('burger-btn--open');
      }
    };

    const openCatalog = () => {
      closeBurger();
      closeSearch();
      catalogBtns.forEach(btn => btn.classList.add('catalog-btn--open'));
      document.documentElement.classList.add('catalog-menu--open');
      if (typeof lenis !== 'undefined') lenis.stop();
      updateAllWrappersHeight();
      if (!isMobileQuery.matches && menuBlocks.length > 0) {
        switchTab(menuBlocks[0].getAttribute('data-target'));
      }
      syncBurgerBtnState();
    };

    const closeCatalog = () => {
      catalogBtns.forEach(btn => btn.classList.remove('catalog-btn--open'));
      document.documentElement.classList.remove('catalog-menu--open');
      if (typeof lenis !== 'undefined') lenis.start();
      document.dispatchEvent(new CustomEvent('menu:close'));
      resetTabs();
      syncBurgerBtnState();
    };

    const toggleCatalog = (e) => {
      e.preventDefault();
      if (document.documentElement.classList.contains('catalog-menu--open')) {
        closeCatalog();
      } else {
        openCatalog();
      }
    };

    const openBurger = () => {
      closeCatalog();
      closeSearch();
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

    const openSearch = () => {
      closeCatalog();
      closeBurger();
      if (mobileSearchBtn) mobileSearchBtn.classList.add('mobile-search-btn--open');
      document.documentElement.classList.add('mobile-search-menu--open');
      if (typeof lenis !== 'undefined') lenis.stop();
      syncBurgerBtnState();
    };

    const closeSearch = () => {
      if (mobileSearchBtn) mobileSearchBtn.classList.remove('mobile-search-btn--open');
      document.documentElement.classList.remove('mobile-search-menu--open');
      if (typeof lenis !== 'undefined') lenis.start();
      syncBurgerBtnState();
    };

    const toggleSearch = (e) => {
      e.preventDefault();
      if (document.documentElement.classList.contains('mobile-search-menu--open')) {
        closeSearch();
      } else {
        openSearch();
      }
    };

    const switchTab = (targetId) => {
      menuBlocks.forEach(block => {
        block.classList.toggle('menu__block--active', block.getAttribute('data-target') === targetId);
      });
      menuItems.forEach(item => {
        item.classList.toggle('menu__items--active', item.getAttribute('data-panel') === targetId);
      });
      updateAllWrappersHeight();
    };

    const toggleMobileAccordion = (block, targetId) => {
      const correspondingPanel = catalogMenu ? catalogMenu.querySelector(`[data-panel="${targetId}"]`) : null;
      if (!correspondingPanel) return;
      if (block.classList.contains('menu__block--active')) {
        block.classList.remove('menu__block--active');
        correspondingPanel.classList.remove('menu__items--active');
        correspondingPanel.style.maxHeight = null;
      } else {
        resetTabs();
        block.classList.add('menu__block--active');
        correspondingPanel.classList.add('menu__items--active');
        correspondingPanel.style.maxHeight = correspondingPanel.scrollHeight + 'px';
      }
    };

    const resetTabs = () => {
      menuBlocks.forEach(block => block.classList.remove('menu__block--active'));
      menuItems.forEach(item => {
        item.classList.remove('menu__items--active');
        item.style.maxHeight = null;
      });
      blockWrappers.forEach(wrapper => wrapper.removeAttribute('style'));
    };

    const handleBlockInteraction = (e, block, interactionType) => {
      const targetId = block.getAttribute('data-target');
      if (!targetId) return;
      if (isMobileQuery.matches && interactionType === 'click') {
        e.preventDefault();
        toggleMobileAccordion(block, targetId);
      } else if (!isMobileQuery.matches && interactionType === 'mouseenter') {
        switchTab(targetId);
      }
    };

    if (burgerBtn) {
      burgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isCatalogOpen = document.documentElement.classList.contains('catalog-menu--open');
        const isBurgerOpen = document.documentElement.classList.contains('burger-menu--open');
        const isSearchOpen = document.documentElement.classList.contains('mobile-search-menu--open');

        if (isCatalogOpen || isBurgerOpen || isSearchOpen) {
          closeCatalog();
          closeBurger();
          closeSearch();
        } else {
          openBurger();
        }
      });
    }

    catalogBtns.forEach(btn => btn.addEventListener('click', toggleCatalog));
    if (mobileSearchBtn && mobileSearchMenu) mobileSearchBtn.addEventListener('click', toggleSearch);

    menuBlocks.forEach(block => {
      block.addEventListener('mouseenter', (e) => handleBlockInteraction(e, block, 'mouseenter'));
      block.addEventListener('click', (e) => handleBlockInteraction(e, block, 'click'));
    });

    const handleBreakpointChange = (e) => {
      resetTabs();
      updateAllWrappersHeight();
      if (!e.matches && document.documentElement.classList.contains('catalog-menu--open') && menuBlocks.length > 0) {
        switchTab(menuBlocks[0].getAttribute('data-target'));
      }
    };

    try {
      isMobileQuery.addEventListener('change', handleBreakpointChange);
    } catch (err) {
      isMobileQuery.addListener(handleBreakpointChange);
    }

    window.addEventListener('resize', () => {
      if (isMobileQuery.matches) {
        blockWrappers.forEach(wrapper => wrapper.removeAttribute('style'));
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === "Escape") {
        closeCatalog();
        closeBurger();
        closeSearch();
      }
    });

    document.addEventListener('click', (event) => {
      const isCatalogOpen = document.documentElement.classList.contains('catalog-menu--open');
      const isBurgerOpen = document.documentElement.classList.contains('burger-menu--open');
      const isSearchOpen = document.documentElement.classList.contains('mobile-search-menu--open');

      const headerSearch = document.querySelector('.header__search');
      const clickInsideHeaderSearch = headerSearch ? headerSearch.contains(event.target) : false;

      let clickOnCatalogBtn = false;
      catalogBtns.forEach(btn => { if (btn.contains(event.target)) clickOnCatalogBtn = true; });

      const clickOnBurgerBtn = burgerBtn && burgerBtn.contains(event.target);
      const clickOnSearchBtn = mobileSearchBtn && mobileSearchBtn.contains(event.target);

      if (isCatalogOpen) {
        const clickInsideCatalog = catalogMenu && catalogMenu.contains(event.target);
        const clickOnCatalogLink = catalogMenu && catalogMenu.contains(event.target) && event.target.tagName === 'A';
        if ((!clickInsideCatalog && !clickOnCatalogBtn) || clickOnCatalogLink) {
          closeCatalog();
        }
      }

      if (isBurgerOpen) {
        const clickInsideBurger = burgerMenu && burgerMenu.contains(event.target);
        const clickOnBurgerLink = burgerMenu && burgerMenu.contains(event.target) && event.target.tagName === 'A';
        if ((!clickInsideBurger && !clickOnBurgerBtn && !clickInsideHeaderSearch) || clickOnBurgerLink) {
          closeBurger();
        }
      }

      if (isSearchOpen) {
        const clickInsideSearch = mobileSearchMenu && mobileSearchMenu.contains(event.target);
        if (!clickInsideSearch && !clickOnSearchBtn && !clickOnBurgerBtn && !clickInsideHeaderSearch) {
          closeSearch();
        }
      }
    });
    initHeightTracking();
  })();

  /**
   * Функция для фикс. кнопки связи
   */
  (function () {
    const social = document.querySelector('.social');
    if (!social) return;

    const btn = social.querySelector('.social__item-btn');
    if (!btn) return;

    const mediaQuery = window.matchMedia('(max-width: 600px)');

    const handleMouseEnter = () => {
      if (!mediaQuery.matches) {
        social.classList.add('active');
      }
    };

    const handleMouseLeave = () => {
      if (!mediaQuery.matches) {
        social.classList.remove('active');
      }
    };

    const handleClick = (e) => {
      if (mediaQuery.matches) {
        e.preventDefault();
        social.classList.toggle('active');
      }
    };

    social.addEventListener('mouseenter', handleMouseEnter);
    social.addEventListener('mouseleave', handleMouseLeave);
    btn.addEventListener('click', handleClick);

    social.addEventListener('click', (e) => {
      if (mediaQuery.matches && e.target.closest('a:not(.social__item-btn)')) {
        social.classList.remove('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (mediaQuery.matches && social.classList.contains('active') && !social.contains(e.target)) {
        social.classList.remove('active');
      }
    });
  })();


  /**
   * Функция аккордиона
   */
  (function accordionFunc() {
    const accordionContainers = document.querySelectorAll('.accordion-items');
    if (!accordionContainers.length) return;

    const activeClass = 'accordion-item--active';

    // 1. Клик на элементы аккордеона
    document.addEventListener('click', (e) => {
      // Находим ближайшую кнопку/шапку аккордеона, по которой кликнули
      const head = e.target.closest('.accordion-head');
      if (!head) return;

      const currentItem = head.closest('.accordion-item');
      const currentContainer = currentItem.closest('.accordion-items');

      // Находим только элементы этого же уровня (не трогаем вложенные внутрь)
      const siblingItems = Array.from(currentContainer.children).filter(child =>
        child.classList.contains('accordion-item')
      );

      // Закрываем соседей на этом же уровне
      siblingItems.forEach(i => {
        if (i !== currentItem) i.classList.remove(activeClass);
      });

      // Переключаем текущий элемент
      currentItem.classList.toggle(activeClass);

      // Управляем классом activated для текущего контейнера
      const hasActiveChild = siblingItems.some(i => i.classList.contains(activeClass));
      if (hasActiveChild) {
        currentContainer.classList.add('activated');
      } else {
        currentContainer.classList.remove('activated');
      }

      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });

    // 2. Глобальный обработчик для закрытия при клике ВНЕ аккордеона
    document.addEventListener('click', (e) => {
      // Если кликнули внутрь какого-то аккордеона, эту логику пропускаем
      if (e.target.closest('.accordion-items')) return;

      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove(activeClass);
      });
      accordionContainers.forEach(container => {
        container.classList.remove('activated');
      });

      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });

    // 3. Глобальный обработчик Escape
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;

      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove(activeClass);
      });
      accordionContainers.forEach(container => {
        container.classList.remove('activated');
      });

      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });

  })();

  /**
   * Анимация текста
   */
  gsap.utils.toArray('[data-split="lines"]').forEach(dataSplitLines => {
    const textSplits = dataSplitLines.querySelectorAll('h1, h2, p');

    const isMobile = window.innerWidth < 600;
    const animSettings = {
      duration: isMobile ? 0.2 : 0.3, // на мобилке дольше
      stagger: isMobile ? 0.1 : 0.1  // на мобилке задержка больше
    };

    textSplits.forEach(textSplit => {

      if (isMobile) {
        const brs = textSplit.querySelectorAll('br');
        brs.forEach(br => br.remove());
      }

      if (textSplit && !isMobile) SplitText.create(textSplit, {
        type: "words,lines",
        mask: "lines",
        linesClass: "line",
        autoSplit: true,
        onSplit: inst => gsap.from(inst.lines, {
          yPercent: 120,
          duration: animSettings.duration,
          stagger: animSettings.stagger,
          scrollTrigger: {
            trigger: dataSplitLines,
            start: "top 95%",
            end: "bottom top",
          }
        })
      });

    });
  });

  gsap.utils.toArray('[data-split="text"]').forEach(dataSplitText => {
    const isMobile = window.innerWidth < 600;
    const textSplit = dataSplitText.querySelectorAll('*');
    if (textSplit && !isMobile) SplitText.create(textSplit, {
      type: "words",
      aria: "hidden",
      onSplit: split => gsap.from(split.words, {
        opacity: 0,
        // duration: 0.3,
        duration: isMobile ? 0.2 : 0.3,
        // stagger: 0.05,
        stagger: isMobile ? 0.03 : 0.05,
        ease: "sine.out",
        scrollTrigger: {
          trigger: dataSplitText,
          start: "top 95%",
          end: "bottom top",
        }
      })
    });
  });

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

          // Начальное состояние: уменьшены и прозрачны
          scale: 0.8,
          opacity: 0,

          // Настройки появления по очереди
          stagger: {
            each: 0.2, // задержка 0.2 сек между каждым айтемом
            from: "start" // начинаем с первого в DOM
          },

          duration: 0.8,
          ease: "back.out(1.7)", // пружинистый эффект в конце увеличения

          // Настройка скролла
          scrollTrigger: {
            trigger: items, // Родитель всей сетки (замените на ваш класс)
            start: "top 90%", // Анимация начнется, когда верх блока достигнет 85% высоты экрана
            // toggleActions: "play none none none" // Проигрывать при скролле вниз, откатывать при скролле вверх

            onEnter: () => items.classList.add('anim-animated'),
          }
        });
      });
    }
  })();

  /**
   * Инициализация слайдера
   */
  // (function swiperWrapper() {

  //   if (!document.querySelector('.swiper')) return;

  //   const globalImpulseOptions = {
  //     // Максимальный интервал между кликами в мс который считается быстрым
  //     fastClickDelay: 200,

  //     // Насколько сильно каждый быстрый клик увеличивает импульс
  //     // Формула: impulse += (fastClickDelay - delta) * accelerationFactor
  //     accelerationFactor: 0.23,

  //     // Коэффициент затухания импульса (0-1), теряет 15% каждые 40мс
  //     friction: 0.85,

  //     // Верхняя граница импульса, итоговый шаг = 1 + round(impulse)
  //     maxExtraSteps: 2,

  //     // Как часто пересчитывается затухание в мс, ~2-3 кадра при 60fps
  //     decayInterval: 40,
  //   };

  //   const slidersConfig = [
  //     {
  //       sliderSelector: '.hero__slider',
  //       highlight: false,
  //       thumbs: {
  //         sliderSelector: '.hero__cover-slider',
  //         highlight: false,
  //         swiperOptions: {
  //           slidesPerGroup: 1,
  //           slidesPerView: 1,
  //           spaceBetween: 0,
  //           speed: 1000,
  //           grabCursor: false,
  //           loop: true,
  //           touchRatio: 1.6,
  //           resistance: true,
  //           resistanceRatio: 0.4,
  //           centeredSlides: false,
  //           centeredSlidesBounds: true,
  //           simulateTouch: true,
  //           direction: 'horizontal',
  //           touchStartPreventDefault: true,
  //           touchMoveStopPropagation: true,
  //           threshold: 8,
  //           touchAngle: 25,
  //           watchOverflow: true,
  //           freeMode: false,

  //           effect: 'fade',
  //           fadeEffect: {
  //             crossFade: true,
  //           },
  //           // effect: 'flip',
  //           // flipEffect: {
  //           //   slideShadows: false,
  //           //   limitRotation: true,
  //           // },
  //           autoplay: false,
  //           mousewheel: false,
  //           pagination: false,
  //           navigation: false,
  //           noSwipingClass: 'swiper-no-swiping',
  //         },
  //       },
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 1,
  //         spaceBetween: 100,
  //         speed: 1000,
  //         grabCursor: true,
  //         loop: true,
  //         touchRatio: 1.6,
  //         resistance: true,
  //         resistanceRatio: 0.4,
  //         centeredSlides: false,
  //         centeredSlidesBounds: true,
  //         simulateTouch: true,
  //         direction: 'horizontal',
  //         touchStartPreventDefault: true,
  //         touchMoveStopPropagation: true,
  //         threshold: 8,
  //         touchAngle: 25,
  //         watchOverflow: true,
  //         freeMode: false,
  //         effect: 'fade',
  //         fadeEffect: {
  //           crossFade: true,
  //         },
  //         autoplay: {
  //           delay: 5000,
  //           disableOnInteraction: false,
  //         },
  //         mousewheel: {
  //           forceToAxis: true,
  //           sensitivity: 1,
  //           releaseOnEdges: true,
  //         },
  //         pagination: {
  //           el: '.hero-swiper-pagination',
  //           clickable: true,
  //         },
  //         navigation: false,
  //         breakpoints: {
  //           601: {
  //             slidesPerGroup: 1,
  //             slidesPerView: 1,
  //             spaceBetween: 240,
  //           },
  //         }
  //       },
  //     },
  //     // {
  //     //   sliderSelector: '.facts__slider',
  //     //   prevSelector: '.facts-button-prev',
  //     //   nextSelector: '.facts-button-next',
  //     //   clipEffect: true,
  //     //   highlight: false,
  //     //   swiperOptions: {
  //     //     slidesPerGroup: 1,
  //     //     slidesPerView: 1,
  //     //     spaceBetween: 0,
  //     //     speed: 500,
  //     //     grabCursor: true,
  //     //     loop: false,
  //     //     touchRatio: 1.6,
  //     //     resistance: true,
  //     //     resistanceRatio: 0.4,
  //     //     centeredSlides: false,
  //     //     centeredSlidesBounds: true,
  //     //     simulateTouch: true,
  //     //     direction: 'horizontal',
  //     //     touchStartPreventDefault: true,
  //     //     touchMoveStopPropagation: true,
  //     //     threshold: 8,
  //     //     touchAngle: 25,
  //     //     watchOverflow: true,
  //     //     navigation: false,
  //     //     allowTouchMove: false,
  //     //     pagination: {
  //     //       el: '.facts-swiper-pagination',
  //     //       clickable: true,
  //     //       renderBullet: function (index, className) {
  //     //         return `<span class="${className}" data-index="${index}"></span>`;
  //     //       }
  //     //     },
  //     //     freeMode: false,
  //     //     mousewheel: {
  //     //       forceToAxis: true,
  //     //       sensitivity: 1,
  //     //       releaseOnEdges: true,
  //     //     },
  //     //     breakpoints: {
  //     //       601: {
  //     //         pagination: {
  //     //           el: '.facts-swiper-pagination',
  //     //           clickable: true,
  //     //           renderBullet: function (index, className) {
  //     //             return `<span class="${className}" data-index="${index}"></span>`;
  //     //           }
  //     //         },
  //     //       },
  //     //     },
  //     //   },
  //     // },
  //     {
  //       sliderSelector: '.novelty__slider',
  //       prevSelector: '.novelty-button-prev',
  //       nextSelector: '.novelty-button-next',
  //       highlight: false,
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 2,
  //         spaceBetween: 8,
  //         speed: 500,
  //         grabCursor: true,
  //         loop: false,
  //         touchRatio: 1.6,
  //         resistance: true,
  //         resistanceRatio: 0.4,
  //         centeredSlides: false,
  //         centeredSlidesBounds: true,
  //         simulateTouch: true,
  //         direction: 'horizontal',
  //         touchStartPreventDefault: true,
  //         touchMoveStopPropagation: true,
  //         threshold: 8,
  //         touchAngle: 25,
  //         watchOverflow: true,
  //         noSwipingClass: 'swiper-no-swiping',
  //         pagination: {
  //           el: '.swiper-pagination',
  //           clickable: true,
  //           renderBullet: function (index, className) {
  //             return `<span class="${className}" data-index="${index}"></span>`;
  //           }
  //         },
  //         freeMode: {
  //           enabled: true,
  //           momentum: true,
  //           momentumRatio: 0.85,
  //           momentumVelocityRatio: 1,
  //           momentumBounce: false,
  //           sticky: true,
  //         },
  //         mousewheel: {
  //           forceToAxis: true,
  //           sensitivity: 1,
  //           releaseOnEdges: true,
  //         },
  //         navigation: false,
  //         breakpoints: {
  //           601: {
  //             slidesPerGroup: 1,
  //             slidesPerView: 6,
  //             spaceBetween: 20,
  //             pagination: {
  //               el: '.swiper-pagination',
  //               clickable: true,
  //               renderBullet: function (index, className) {
  //                 return `<span class="${className}" data-index="${index}"></span>`;
  //               }
  //             },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       sliderSelector: '.blog__slider',
  //       prevSelector: '.blog-button-prev',
  //       nextSelector: '.blog-button-next',
  //       highlight: false,
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 2,
  //         spaceBetween: 8,
  //         speed: 500,
  //         grabCursor: true,
  //         loop: false,
  //         touchRatio: 1.6,
  //         resistance: true,
  //         resistanceRatio: 0.4,
  //         centeredSlides: false,
  //         centeredSlidesBounds: true,
  //         simulateTouch: true,
  //         direction: 'horizontal',
  //         touchStartPreventDefault: true,
  //         touchMoveStopPropagation: true,
  //         threshold: 8,
  //         touchAngle: 25,
  //         watchOverflow: true,
  //         pagination: {
  //           el: '.swiper-pagination',
  //           clickable: true,
  //           renderBullet: function (index, className) {
  //             return `<span class="${className}" data-index="${index}"></span>`;
  //           }
  //         },
  //         freeMode: {
  //           enabled: true,
  //           momentum: true,
  //           momentumRatio: 0.85,
  //           momentumVelocityRatio: 1,
  //           momentumBounce: false,
  //           sticky: true,
  //         },
  //         mousewheel: {
  //           forceToAxis: true,
  //           sensitivity: 1,
  //           releaseOnEdges: true,
  //         },
  //         navigation: false,
  //         breakpoints: {
  //           601: {
  //             slidesPerGroup: 1,
  //             slidesPerView: 4,
  //             spaceBetween: 20,
  //             pagination: {
  //               el: '.swiper-pagination',
  //               clickable: true,
  //               renderBullet: function (index, className) {
  //                 return `<span class="${className}" data-index="${index}"></span>`;
  //               }
  //             },
  //           },
  //         },
  //       },
  //     },
  //     // {
  //     //   sliderSelector: '.brands__slider',
  //     //   highlight: false,
  //     //   swiperOptions: {
  //     //     modules: [Swiper.prototype.modules ? Swiper.prototype.modules.Grid : Swiper.Grid],
  //     //     direction: 'horizontal',
  //     //     grid: {
  //     //       rows: 2,
  //     //       fill: 'row',
  //     //     },
  //     //     slidesPerGroup: 2,
  //     //     slidesPerView: 2,
  //     //     spaceBetween: 8,
  //     //     speed: 500,
  //     //     grabCursor: true,
  //     //     loop: true,
  //     //     touchRatio: 1.6,
  //     //     resistance: true,
  //     //     resistanceRatio: 0.4,
  //     //     centeredSlides: false,
  //     //     centeredSlidesBounds: true,
  //     //     simulateTouch: true,
  //     //     direction: 'horizontal',
  //     //     touchStartPreventDefault: true,
  //     //     touchMoveStopPropagation: true,
  //     //     threshold: 8,
  //     //     touchAngle: 25,
  //     //     watchOverflow: true,
  //     //     freeMode: false,
  //     //     mousewheel: {
  //     //       forceToAxis: true,
  //     //       sensitivity: 1,
  //     //       releaseOnEdges: true,
  //     //     },
  //     //     navigation: false,
  //     //     breakpoints: {
  //     //       601: {
  //     //         slidesPerGroup: 1,
  //     //         slidesPerView: 6,
  //     //         spaceBetween: 10,
  //     //         grid: false,
  //     //       },
  //     //     },
  //     //   },
  //     // },
  //     {
  //       sliderSelector: '.brands__slider',
  //       highlight: false,
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 'auto',
  //         spaceBetween: 8,
  //         speed: 5000,
  //         loop: true,
  //         direction: 'horizontal',
  //         watchOverflow: true,
  //         allowTouchMove: true,
  //         simulateTouch: true,
  //         grabCursor: true,
  //         mousewheel: true,
  //         autoplay: {
  //           delay: 0,
  //           disableOnInteraction: false,
  //         },
  //         freeMode: {
  //           enabled: true,
  //           momentum: false,
  //           sticky: false,
  //         },
  //         navigation: false,
  //         breakpoints: {
  //           601: {
  //             spaceBetween: 10,
  //           },
  //         },
  //       },
  //     },
  //     {
  //       sliderSelector: '.topsellers__slider',
  //       prevSelector: '.topsellers-button-prev',
  //       nextSelector: '.topsellers-button-next',
  //       highlight: false,
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 2,
  //         spaceBetween: 8,
  //         speed: 500,
  //         grabCursor: true,
  //         loop: false,
  //         touchRatio: 1.6,
  //         resistance: true,
  //         resistanceRatio: 0.4,
  //         centeredSlides: false,
  //         centeredSlidesBounds: true,
  //         simulateTouch: true,
  //         direction: 'horizontal',
  //         touchStartPreventDefault: true,
  //         touchMoveStopPropagation: true,
  //         threshold: 8,
  //         touchAngle: 25,
  //         watchOverflow: true,
  //         noSwipingClass: 'swiper-no-swiping',
  //         pagination: {
  //           el: '.swiper-pagination',
  //           clickable: true,
  //           renderBullet: function (index, className) {
  //             return `<span class="${className}" data-index="${index}"></span>`;
  //           }
  //         },
  //         freeMode: {
  //           enabled: true,
  //           momentum: true,
  //           momentumRatio: 0.85,
  //           momentumVelocityRatio: 1,
  //           momentumBounce: false,
  //           sticky: true,
  //         },
  //         mousewheel: {
  //           forceToAxis: true,
  //           sensitivity: 1,
  //           releaseOnEdges: true,
  //         },
  //         navigation: false,
  //         breakpoints: {
  //           601: {
  //             slidesPerGroup: 1,
  //             slidesPerView: 6,
  //             spaceBetween: 20,
  //             pagination: {
  //               el: '.swiper-pagination',
  //               clickable: true,
  //               renderBullet: function (index, className) {
  //                 return `<span class="${className}" data-index="${index}"></span>`;
  //               }
  //             },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       sliderSelector: '.reviews__slider',
  //       prevSelector: '.reviews-button-prev',
  //       nextSelector: '.reviews-button-next',
  //       highlight: false,
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 1.5,
  //         spaceBetween: 8,
  //         speed: 500,
  //         grabCursor: true,
  //         loop: false,
  //         touchRatio: 1.6,
  //         resistance: true,
  //         resistanceRatio: 0.4,
  //         centeredSlides: false,
  //         centeredSlidesBounds: true,
  //         simulateTouch: true,
  //         direction: 'horizontal',
  //         touchStartPreventDefault: true,
  //         touchMoveStopPropagation: true,
  //         threshold: 8,
  //         touchAngle: 25,
  //         watchOverflow: true,
  //         noSwipingClass: 'swiper-no-swiping',
  //         watchSlidesProgress: true,
  //         pagination: {
  //           el: '.swiper-pagination',
  //           clickable: true,
  //           renderBullet: function (index, className) {
  //             return `<span class="${className}" data-index="${index}"></span>`;
  //           }
  //         },
  //         freeMode: {
  //           enabled: true,
  //           momentum: true,
  //           momentumRatio: 0.85,
  //           momentumVelocityRatio: 1,
  //           momentumBounce: false,
  //           sticky: true,
  //         },
  //         mousewheel: {
  //           forceToAxis: true,
  //           sensitivity: 1,
  //           releaseOnEdges: true,
  //         },
  //         navigation: false,
  //         breakpoints: {
  //           601: {
  //             slidesPerGroup: 1,
  //             slidesPerView: 4,
  //             spaceBetween: 20,
  //             pagination: {
  //               el: '.swiper-pagination',
  //               clickable: true,
  //               renderBullet: function (index, className) {
  //                 return `<span class="${className}" data-index="${index}"></span>`;
  //               }
  //             },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       sliderSelector: '.category__slider',
  //       prevSelector: '.category-button-prev',
  //       nextSelector: '.category-button-next',
  //       highlight: false,
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 2,
  //         spaceBetween: 8,
  //         speed: 500,
  //         grabCursor: true,
  //         loop: false,
  //         touchRatio: 1.6,
  //         resistance: true,
  //         resistanceRatio: 0.4,
  //         centeredSlides: false,
  //         centeredSlidesBounds: true,
  //         simulateTouch: true,
  //         direction: 'horizontal',
  //         touchStartPreventDefault: true,
  //         touchMoveStopPropagation: true,
  //         threshold: 8,
  //         touchAngle: 25,
  //         watchOverflow: true,
  //         noSwipingClass: 'swiper-no-swiping',
  //         freeMode: {
  //           enabled: true,
  //           momentum: true,
  //           momentumRatio: 0.85,
  //           momentumVelocityRatio: 1,
  //           momentumBounce: false,
  //           sticky: true,
  //         },
  //         mousewheel: {
  //           forceToAxis: true,
  //           sensitivity: 1,
  //           releaseOnEdges: true,
  //         },
  //         navigation: false,
  //         breakpoints: {
  //           601: {
  //             slidesPerGroup: 1,
  //             slidesPerView: 7,
  //             spaceBetween: 10,
  //           },
  //         },
  //       },
  //     },
  //     {
  //       sliderSelector: '.product__slider-big',
  //       prevSelector: '.product-button-prev',
  //       nextSelector: '.product-button-next',
  //       highlight: false,
  //       thumbs: {
  //         sliderSelector: '.product__slider-min',
  //         highlight: false,
  //         swiperOptions: {
  //           slidesPerGroup: 1,
  //           slidesPerView: 5,
  //           spaceBetween: 10,
  //           speed: 1000,
  //           grabCursor: false,
  //           loop: false,
  //           touchRatio: 1.6,
  //           resistance: true,
  //           resistanceRatio: 0.4,
  //           centeredSlides: false,
  //           centeredSlidesBounds: true,
  //           simulateTouch: true,
  //           direction: 'horizontal',
  //           touchStartPreventDefault: true,
  //           touchMoveStopPropagation: true,
  //           threshold: 8,
  //           touchAngle: 25,
  //           watchOverflow: true,
  //           freeMode: false,
  //           autoplay: false,
  //           mousewheel: false,
  //           pagination: false,
  //           navigation: false,
  //         },
  //       },
  //       swiperOptions: {
  //         slidesPerGroup: 1,
  //         slidesPerView: 1,
  //         spaceBetween: 0,
  //         speed: 1000,
  //         grabCursor: true,
  //         loop: false,
  //         touchRatio: 1.6,
  //         resistance: true,
  //         resistanceRatio: 0.4,
  //         centeredSlides: false,
  //         centeredSlidesBounds: true,
  //         simulateTouch: true,
  //         direction: 'horizontal',
  //         touchStartPreventDefault: true,
  //         touchMoveStopPropagation: true,
  //         threshold: 8,
  //         touchAngle: 25,
  //         watchOverflow: true,
  //         freeMode: false,
  //         mousewheel: {
  //           forceToAxis: true,
  //           sensitivity: 1,
  //           releaseOnEdges: true,
  //         },
  //         pagination: {
  //           el: '.product-swiper-pagination',
  //           clickable: true,
  //         },
  //         navigation: false,
  //       },
  //     },
  //   ];

  //   // Инициализируем каждый слайдер из конфига
  //   slidersConfig.forEach(({ sliderSelector, prevSelector, nextSelector, highlight, thumbs, autoSlidesView, swiperOptions }) => {

  //     if (!document.querySelector(sliderSelector)) return;

  //     if (autoSlidesView) {
  //       applyAutoSlidesView(swiperOptions);
  //     }

  //     // Ищем кнопки только если селекторы заданы в конфиге
  //     // Если prevSelector/nextSelector не указаны - слайдер без кнопок навигации
  //     const prevEl = prevSelector ? document.querySelector(prevSelector) : null;
  //     const nextEl = nextSelector ? document.querySelector(nextSelector) : null;

  //     // ищем highlight-элементы только если в конфиге явно указано highlight: true
  //     // если false или не указано - передаём null и createHighlight вернёт заглушку
  //     const fromEl = highlight ? document.querySelector(`${sliderSelector} .slider-highlight--from`) : null;
  //     const toEl = highlight ? document.querySelector(`${sliderSelector} .slider-highlight--to`) : null;

  //     if (thumbs) {
  //       const thumbsEl = document.querySelector(thumbs.sliderSelector);

  //       if (!thumbsEl) {
  //         console.warn(`Swiper thumbs: элемент "${thumbs.sliderSelector}" не найден.`);
  //       } else {
  //         const thumbsSwiper = new Swiper(thumbs.sliderSelector, thumbs.swiperOptions);

  //         swiperOptions.thumbs = { swiper: thumbsSwiper };
  //       }
  //     }

  //     const swiper = new Swiper(sliderSelector, swiperOptions);

  //     if (swiperOptions.pagination && swiperOptions.pagination.el) {
  //       swiper.on('slideChange', () => {
  //         const paginationEl = swiper.pagination?.el;
  //         if (!paginationEl) return;

  //         const realIndex = swiper.realIndex;
  //         const step = 2.9; // 2.7rem ширина + 0.2rem отступы
  //         const bullets = paginationEl.querySelectorAll('.swiper-pagination-bullet');
  //         const totalBullets = bullets.length;

  //         let translateValue = 0;

  //         // Начинаем двигать карусель только с 3-го буллета (индекс 2)
  //         if (realIndex >= 2) {
  //           // Защита правого края: если мы уперлись в последние 2 слайда, 
  //           // останавливаем карусель, чтобы не показывать пустоту справа
  //           if (realIndex >= totalBullets - 2) {
  //             translateValue = (totalBullets - 5) * -step;
  //           } else {
  //             // Центрируем активный буллет на 3-й позиции (индекс 2)
  //             translateValue = (realIndex - 2) * -step;
  //           }
  //         }

  //         // Защитный фолбек: если слайдов всего меньше 5, карусель вообще не должна двигаться
  //         if (totalBullets <= 5) {
  //           translateValue = 0;
  //         }

  //         // Применяем плавное смещение к каждому буллету
  //         bullets.forEach(bullet => {
  //           bullet.style.transform = `translateX(${translateValue}rem)`;
  //           bullet.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  //         });
  //       });
  //     }

  //     // Управление пагинацией через кастомный флаг hidePagination в брейкпоинтах
  //     initPaginationBreakpoint(swiper);

  //     // highlight создаём всегда - если элементов нет, вернётся заглушка
  //     // edgeTracker и navigation получат корректный объект в любом случае
  //     const highlightInstance = createHighlight(swiper, fromEl, toEl);

  //     // EdgeTracker подключаем только если slidesPerView больше 1 хотя бы
  //     // в одном брейкпоинте или в базовых настройках - иначе смысла нет
  //     const needsEdgeTracker = shouldUseEdgeTracker(swiperOptions);
  //     const edgeTracker = needsEdgeTracker
  //       ? createEdgeTracker(swiper, highlightInstance)
  //       : createEdgeTrackerStub();

  //     // Навигацию подключаем только если обе кнопки реально найдены в DOM
  //     if (prevEl || nextEl) {
  //       createNavigation(swiper, prevEl, nextEl, highlightInstance, edgeTracker);
  //     }
  //   });

  //   function applyAutoSlidesView(swiperOptions) {

  //     swiperOptions.centeredSlidesBounds = false;

  //     if (swiperOptions.freeMode) {
  //       swiperOptions.freeMode.sticky = false;
  //     }

  //     const breakpoints = swiperOptions.breakpoints ?? {};
  //     Object.values(breakpoints).forEach(bp => {
  //       if (bp.slidesPerView === 'auto') {
  //         bp.centeredSlidesBounds = false;
  //         if (bp.sticky !== undefined) bp.sticky = false;
  //       }
  //     });
  //   }

  //   // Проверяет нужен ли edgeTracker для данного слайдера.
  //   // Смотрим на базовый slidesPerView и на все брейкпоинты -
  //   // если хоть где-то больше 1 (и не 'auto') то tracker нужен
  //   function shouldUseEdgeTracker(swiperOptions) {
  //     const base = swiperOptions.slidesPerView;
  //     if (typeof base === 'number' && base > 1) return true;

  //     const breakpoints = swiperOptions.breakpoints ?? {};
  //     return Object.values(breakpoints).some(bp => {
  //       return typeof bp.slidesPerView === 'number' && bp.slidesPerView > 1;
  //     });
  //   }

  //   // Заглушка edgeTracker для слайдеров где он не нужен (slidesPerView = 1).
  //   // Возвращает тот же API что и настоящий edgeTracker - navigation не знает разницы
  //   function createEdgeTrackerStub() {
  //     return {
  //       handleEdgeNext: () => false,
  //       handleEdgePrev: () => false,
  //       clearVirtual: () => { },
  //       getVirtualIndex: () => null,
  //     };
  //   }

  //   // Управление видимостью пагинации через кастомный флаг hidePagination.
  //   // Swiper не умеет включать/выключать пагинацию через breakpoints нативно,
  //   // поэтому слушаем событие breakpoint и управляем display вручную
  //   function initPaginationBreakpoint(swiper) {
  //     const paginationEl = swiper.pagination?.el;
  //     if (!paginationEl) return;

  //     function applyVisibility() {
  //       // currentBreakpointParams содержит параметры активного брейкпоинта
  //       const params = swiper.currentBreakpointParams ?? {};
  //       paginationEl.style.display = params.hidePagination === true ? 'none' : '';
  //     }

  //     swiper.on('breakpoint', applyVisibility);

  //     // Проверяем сразу после инициализации - брейкпоинт уже мог сработать
  //     applyVisibility();
  //   }

  //   // Highlight - анимированный фон резинка между слайдами.
  //   // Если элементов --from и --to нет в DOM - возвращаем заглушку.
  //   // Заглушка имеет тот же API поэтому edgeTracker работает без изменений
  //   function createHighlight(swiper, fromEl, toEl) {

  //     // Нет элементов - возвращаем заглушку с рабочим getGeometry
  //     // edgeTracker использует getGeometry для расчётов даже без визуала
  //     if (!fromEl || !toEl) {
  //       return {
  //         animateTo: () => { },
  //         snapInstant: () => { },
  //         getGeometry: (index) => {
  //           const slide = swiper.slides[index];
  //           if (!slide) return null;
  //           return {
  //             x: slide.offsetLeft + (swiper.translate ?? 0),
  //             width: slide.offsetWidth,
  //           };
  //         },
  //         getCurrentX: () => 0,
  //         getCurrentW: () => 0,
  //       };
  //     }

  //     const DURATION = 320;
  //     const EASE_OUT = 'cubic-bezier(0.4, 0, 0.2, 1)';
  //     const EASE_SNAP = 'cubic-bezier(0.34, 1.4, 0.64, 1)';

  //     let currentX = 0;
  //     let currentWidth = 0;
  //     let rafId = null;

  //     function getGeometry(index) {
  //       const slide = swiper.slides[index];
  //       if (!slide) return null;
  //       return {
  //         x: slide.offsetLeft + (swiper.translate ?? 0),
  //         width: slide.offsetWidth,
  //       };
  //     }

  //     function setInstant(el, x, width, visible) {
  //       el.style.transition = 'none';
  //       el.style.transform = `translateX(${x}px)`;
  //       el.style.width = `${width}px`;
  //       el.classList.toggle('is-visible', visible);
  //     }

  //     function setAnimated(el, x, width, duration, easing, visible) {
  //       el.style.transition = [
  //         `transform ${duration}ms ${easing}`,
  //         `width ${duration}ms ${easing}`,
  //         `opacity ${duration * 0.6}ms ease`,
  //       ].join(', ');
  //       el.style.transform = `translateX(${x}px)`;
  //       el.style.width = `${width}px`;
  //       el.classList.toggle('is-visible', visible);
  //     }

  //     function animateTo(toX, toWidth, dir) {
  //       if (rafId) cancelAnimationFrame(rafId);

  //       const fromX = currentX;
  //       const fromWidth = currentWidth;
  //       const collapseX = dir === 'next' ? fromX + fromWidth : fromX;
  //       const startX = dir === 'next' ? toX : toX + toWidth;

  //       setInstant(fromEl, fromX, fromWidth, true);
  //       setInstant(toEl, startX, 0, true);

  //       // Двойной RAF гарантирует что стили шага 1 применены до старта анимации
  //       rafId = requestAnimationFrame(() => {
  //         rafId = requestAnimationFrame(() => {
  //           rafId = null;
  //           setAnimated(fromEl, collapseX, 0, DURATION, EASE_OUT, false);
  //           setAnimated(toEl, toX, toWidth, DURATION, EASE_SNAP, true);
  //         });
  //       });

  //       // Фиксируем целевую геометрию сразу - не ждём конца анимации
  //       // Следующий вызов animateTo возьмёт правильную стартовую точку
  //       currentX = toX;
  //       currentWidth = toWidth;
  //     }

  //     function snapInstant(index) {
  //       if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  //       const geo = getGeometry(index);
  //       if (!geo) return;
  //       setInstant(fromEl, geo.x, geo.width, true);
  //       setInstant(toEl, geo.x, 0, false);
  //       currentX = geo.x;
  //       currentWidth = geo.width;
  //     }

  //     swiper.on('slideChange', () => {
  //       const curr = swiper.activeIndex;
  //       const prev = swiper.previousIndex ?? curr;
  //       const dir = curr >= prev ? 'next' : 'prev';
  //       const geo = getGeometry(curr);
  //       if (geo) animateTo(geo.x, geo.width, dir);
  //     });

  //     swiper.on('transitionEnd', () => {
  //       setInstant(fromEl, currentX, currentWidth, true);
  //       setInstant(toEl, currentX, 0, false);
  //     });

  //     swiper.on('setTranslate', () => {
  //       if (swiper.animating) return;
  //       const geo = getGeometry(swiper.activeIndex);
  //       if (!geo) return;
  //       if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  //       setInstant(fromEl, geo.x, geo.width, true);
  //       setInstant(toEl, geo.x, 0, false);
  //       currentX = geo.x;
  //       currentWidth = geo.width;
  //     });

  //     swiper.on('resize', () => snapInstant(swiper.activeIndex));

  //     snapInstant(swiper.activeIndex ?? 0);

  //     return {
  //       animateTo,
  //       snapInstant,
  //       getGeometry,
  //       getCurrentX: () => currentX,
  //       getCurrentW: () => currentWidth,
  //     };
  //   }


  //   // EdgeTracker - виртуальный активный слайд когда wrapper упёрся в край.
  //   // Проблема: при slidesPerView > 1 последние слайды никогда не получают
  //   // swiper-slide-active потому что wrapper уже не может сдвинуться.
  //   // Решение: вручную двигаем виртуальный активный по оставшимся слайдам
  //   function createEdgeTracker(swiper, highlight) {

  //     const VIRTUAL_CLASS = 'is-virtual-active';
  //     const BEFORE_EDGE_CLASS = 'is-before-edge';

  //     let virtualIndex = null;

  //     function getVisibleIndices() {
  //       const containerWidth = swiper.width;
  //       const offset = Math.abs(swiper.translate ?? 0);
  //       const visible = [];
  //       swiper.slides.forEach((slide, i) => {
  //         const left = slide.offsetLeft;
  //         const right = left + slide.offsetWidth;
  //         if (right > offset && left < offset + containerWidth) visible.push(i);
  //       });
  //       return visible;
  //     }

  //     function clearBeforeEdge() {
  //       swiper.slides.forEach(s => s.classList.remove(BEFORE_EDGE_CLASS));
  //     }

  //     function markBeforeEdge() {
  //       clearBeforeEdge();
  //       swiper.slides.forEach(s => {
  //         if (s.classList.contains('swiper-slide-active')) {
  //           s.classList.add(BEFORE_EDGE_CLASS);
  //         }
  //       });
  //     }

  //     function clearVirtual() {
  //       swiper.slides.forEach(s => s.classList.remove(VIRTUAL_CLASS));
  //       clearBeforeEdge();
  //       virtualIndex = null;
  //     }

  //     function setVirtualActive(index, dir) {
  //       if (virtualIndex === null) markBeforeEdge();
  //       swiper.slides.forEach(s => s.classList.remove(VIRTUAL_CLASS));
  //       virtualIndex = index;
  //       swiper.slides[index]?.classList.add(VIRTUAL_CLASS);

  //       // highlight может быть заглушкой - вызываем в любом случае
  //       const geo = highlight.getGeometry(index);
  //       if (geo) highlight.animateTo(geo.x, geo.width, dir);
  //     }

  //     function handleEdgeNext() {
  //       if (!swiper.isEnd) return false;
  //       const visible = getVisibleIndices();
  //       if (!visible.length) return false;
  //       const lastVisible = visible[visible.length - 1];
  //       const current = virtualIndex ?? swiper.activeIndex;
  //       if (current >= lastVisible) return true;
  //       setVirtualActive(current + 1, 'next');
  //       return true;
  //     }

  //     function handleEdgePrev() {
  //       if (virtualIndex === null) return false;
  //       const current = virtualIndex;
  //       const realActive = swiper.activeIndex;
  //       if (current <= realActive) {
  //         clearVirtual();
  //         highlight.snapInstant(realActive);
  //         return false;
  //       }
  //       setVirtualActive(current - 1, 'prev');
  //       return true;
  //     }

  //     swiper.on('slideChange', () => {
  //       if (virtualIndex !== null) clearVirtual();
  //     });

  //     swiper.on('fromEdge', () => {
  //       clearVirtual();
  //     });

  //     return {
  //       handleEdgeNext,
  //       handleEdgePrev,
  //       clearVirtual,
  //       getVirtualIndex: () => virtualIndex,
  //     };
  //   }


  //   // Navigation - кнопки + импульс + disabled состояние.
  //   // Вызывается только если у слайдера есть обе кнопки навигации.
  //   // Получает edgeTracker который может быть настоящим или заглушкой
  //   function createNavigation(swiper, prevEl, nextEl, highlight, edgeTracker) {

  //     const {
  //       fastClickDelay = 200,
  //       accelerationFactor = 0.23,
  //       friction = 0.85,
  //       maxExtraSteps = 2,
  //       decayInterval = 40,
  //     } = globalImpulseOptions;

  //     let lastClickTime = 0;
  //     let lastDirection = null;
  //     let extraImpulse = 0;
  //     let decayTimer = null;

  //     function resetImpulse() {
  //       extraImpulse = 0;
  //       lastDirection = null;
  //       if (decayTimer) clearInterval(decayTimer);
  //       decayTimer = null;
  //     }

  //     function accumulateImpulse(direction) {
  //       const now = Date.now();
  //       const delta = now - lastClickTime;

  //       if (lastDirection !== null && lastDirection !== direction) {
  //         extraImpulse = 0;
  //       }

  //       extraImpulse = delta < fastClickDelay
  //         ? Math.min(extraImpulse + (fastClickDelay - delta) * accelerationFactor, maxExtraSteps)
  //         : 0;

  //       lastClickTime = now;
  //       lastDirection = direction;

  //       if (decayTimer) clearInterval(decayTimer);
  //       decayTimer = setInterval(() => {
  //         extraImpulse *= friction;
  //         if (extraImpulse < 0.2) {
  //           extraImpulse = 0;
  //           clearInterval(decayTimer);
  //           decayTimer = null;
  //         }
  //       }, decayInterval);
  //     }

  //     function getVisibleIndicesForNav() {
  //       const containerWidth = swiper.width;
  //       const offset = Math.abs(swiper.translate ?? 0);
  //       const visible = [];
  //       swiper.slides.forEach((slide, i) => {
  //         const left = slide.offsetLeft;
  //         const right = left + slide.offsetWidth;
  //         if (right > offset && left < offset + containerWidth) visible.push(i);
  //       });
  //       return visible;
  //     }

  //     function updateDisabled() {
  //       if (swiper.params.loop) return;

  //       const isStart = swiper.isBeginning && edgeTracker.getVirtualIndex() === null;

  //       let nextBlocked = false;
  //       if (swiper.isEnd) {
  //         const virtualIndex = edgeTracker.getVirtualIndex();
  //         if (virtualIndex === null) {
  //           nextBlocked = true;
  //         } else {
  //           const visible = getVisibleIndicesForNav();
  //           const lastVisible = visible[visible.length - 1] ?? swiper.activeIndex;
  //           nextBlocked = virtualIndex >= lastVisible;
  //         }
  //       }

  //       // disabled как свойство а не атрибут - клик всё равно доходит
  //       // до нашего обработчика даже когда кнопка визуально заблокирована
  //       // if (prevEl) { prevEl.classList.toggle('swiper-button-disabled', isStart); prevEl.disabled = isStart; }
  //       // if (nextEl) { nextEl.classList.toggle('swiper-button-disabled', nextBlocked); nextEl.disabled = nextBlocked; }

  //       prevEl.classList.toggle('swiper-button-disabled', isStart);
  //       nextEl.classList.toggle('swiper-button-disabled', nextBlocked);

  //       prevEl.disabled = isStart;
  //       nextEl.disabled = nextBlocked;
  //     }

  //     function handle(direction) {
  //       if (direction === 'next' && edgeTracker.handleEdgeNext()) {
  //         updateDisabled();
  //         return;
  //       }
  //       if (direction === 'prev' && edgeTracker.handleEdgePrev()) {
  //         updateDisabled();
  //         return;
  //       }



  //       accumulateImpulse(direction);
  //       const steps = 1 + Math.round(extraImpulse);

  //       // if (swiper.params.loop) {
  //       //   const total = swiper.slides.length - (swiper.loopedSlides ?? 0) * 2;
  //       //   const curr = swiper.realIndex;
  //       //   const target = direction === 'next'
  //       //     ? (curr + steps) % total
  //       //     : (curr - steps + total) % total;
  //       //   swiper.slideToLoop(target);
  //       // }

  //       if (swiper.params.loop) {
  //         if (direction === 'next') {
  //           swiper.slideNext();
  //         } else {
  //           swiper.slidePrev();
  //         }
  //         return;
  //       } else {
  //         const base = swiper.activeIndex;
  //         const target = direction === 'next'
  //           ? Math.min(base + steps, swiper.slides.length - 1)
  //           : Math.max(base - steps, 0);
  //         swiper.slideTo(target);
  //       }

  //       // if (nextEl) nextEl.addEventListener('click', (e) => {
  //       //   e.preventDefault();
  //       //   console.log('next clicked', swiper.realIndex);
  //       //   handle('next');
  //       // });

  //       // console.log('loopedSlides:', swiper.loopedSlides);
  //       // console.log('slides.length:', swiper.slides.length);

  //       updateDisabled();
  //     }

  //     // Привязываем обработчики кликов
  //     nextEl.addEventListener('click', (e) => { e.preventDefault(); handle('next'); });
  //     prevEl.addEventListener('click', (e) => { e.preventDefault(); handle('prev'); });

  //     // Сброс импульса при таче
  //     swiper.on('touchStart', resetImpulse);

  //     // Массив событий для мгновенного обновления состояния кнопок
  //     const updateEvents = [
  //       'slideChange',
  //       'resize',
  //       'setTranslate',   // Важно для тачпадов и скролла мыши в реальном времени
  //       'transitionEnd',  // Важно для фиксации состояния после инерции (momentum)
  //       'reachBeginning', // Гарантия срабатывания на левом краю
  //       'reachEnd'        // Гарантия срабатывания на правом краю
  //     ];

  //     // Подписываемся на все события сразу
  //     updateEvents.forEach(event => {
  //       swiper.on(event, updateDisabled);
  //     });

  //     // Очистка при уничтожении слайдера
  //     swiper.on('destroy', () => {
  //       if (decayTimer) clearInterval(decayTimer);
  //       updateEvents.forEach(event => {
  //         swiper.off(event, updateDisabled);
  //       });
  //     });

  //     // Первоначальный вызов при инициализации
  //     updateDisabled();


  //     swiper.on('destroy', () => {
  //       if (decayTimer) clearInterval(decayTimer);
  //       decayTimer = null;
  //     });

  //     updateDisabled();
  //   }

  //   //   if (nextEl) nextEl.addEventListener('click', (e) => { e.preventDefault(); handle('next'); });
  //   //   if (prevEl) prevEl.addEventListener('click', (e) => { e.preventDefault(); handle('prev'); });

  //   //   swiper.on('touchStart', resetImpulse);
  //   //   swiper.on('slideChange', updateDisabled);
  //   //   swiper.on('resize', updateDisabled);
  //   //   swiper.on('touchEnd', () => {
  //   //     const dir = swiper.swipeDirection;
  //   //     if (dir === 'next') edgeTracker.handleEdgeNext();
  //   //     else if (dir === 'prev') edgeTracker.handleEdgePrev();
  //   //     updateDisabled();
  //   //   });

  //   //   swiper.on('destroy', () => {
  //   //     if (decayTimer) clearInterval(decayTimer);
  //   //     decayTimer = null;
  //   //   });

  //   //   updateDisabled();
  //   // }

  //   // Можно добавить этот код один раз, чтобы он следил за изменением высоты BODY и обновлял GSAP
  //   // const ro = new ResizeObserver(() => {
  //   //   ScrollTrigger.refresh();
  //   // });
  //   // ro.observe(document.body);

  // })();

  // function initClipSlider(selector) {
  //   const container = document.querySelector(selector);
  //   if (!container) return null;

  //   const paginationEl =
  //     container.querySelector('.facts-swiper-pagination') ||
  //     document.querySelector('.facts-swiper-pagination');

  //   const swiper = new Swiper(selector, {
  //     slidesPerView: 1,
  //     loop: false,
  //     speed: 0,
  //     grabCursor: true,
  //     allowTouchMove: false,
  //     init: false,
  //   });

  //   const total = () => swiper.slides.length;
  //   let prevIndex = 0;
  //   let blocked = false;
  //   const DURATION = 500;

  //   function renderBullets() {
  //     if (!paginationEl) return;
  //     paginationEl.innerHTML = '';
  //     for (let i = 0; i < total(); i++) {
  //       const b = document.createElement('span');
  //       b.className = 'facts-pagination-bullet';
  //       b.dataset.index = i;
  //       if (i === swiper.activeIndex) b.classList.add('facts-pagination-bullet--active');
  //       paginationEl.appendChild(b);
  //     }
  //   }

  //   function updateBullets() {
  //     if (!paginationEl) return;
  //     paginationEl.querySelectorAll('.facts-pagination-bullet').forEach((b, i) => {
  //       b.classList.toggle('facts-pagination-bullet--active', i === swiper.activeIndex);
  //     });
  //   }

  //   swiper.on('slideChange', () => {
  //     animate(prevIndex, swiper.activeIndex);
  //     prevIndex = swiper.activeIndex;
  //     updateBullets();
  //   });

  //   function goTo(index) {
  //     if (blocked) return;
  //     const to = ((index % total()) + total()) % total();
  //     if (to === swiper.activeIndex) return;
  //     blocked = true;
  //     setTimeout(() => { blocked = false; }, DURATION);
  //     swiper.slideTo(to, 0);
  //   }

  //   function go(isRight) {
  //     goTo(swiper.activeIndex + (isRight ? 1 : -1));
  //   }

  //   function animate(from, to) {
  //     if (from === to) return;
  //     const isRight = to > from || (from === total() - 1 && to === 0);
  //     const cur = swiper.slides[from];
  //     const next = swiper.slides[to];
  //     if (!cur || !next) return;

  //     cur.classList.remove('s--active', 's--active-prev');

  //     const nextImg = next.querySelector('img');
  //     if (nextImg) {
  //       nextImg.style.transition = 'none';
  //       nextImg.style.transform = 'scale(1.3)';
  //       nextImg.getBoundingClientRect();
  //     }

  //     next.classList.add('s--active');
  //     if (!isRight) next.classList.add('s--active-prev');

  //     requestAnimationFrame(() => requestAnimationFrame(() => {
  //       if (nextImg) {
  //         nextImg.style.transition = 'transform 0.5s ease';
  //         nextImg.style.transform = 'scale(1)';
  //       }
  //     }));

  //     const curImg = cur.querySelector('img');
  //     if (curImg) {
  //       curImg.style.transition = 'transform 0.2s ease';
  //       curImg.style.transform = 'scale(1)';
  //     }

  //     container.querySelector('.swiper-slide.s--prev')?.classList.remove('s--prev');
  //     let prev = to - 1;
  //     if (prev < 0) prev = total() - 1;
  //     swiper.slides[prev].classList.add('s--prev');
  //   }

  //   let startX = null;
  //   const THRESHOLD = 50;

  //   container.addEventListener('pointerdown', e => {
  //     if (e.pointerType === 'mouse' && e.button !== 0) return;
  //     startX = e.clientX;
  //     container.setPointerCapture?.(e.pointerId);
  //   }, { passive: true });

  //   container.addEventListener('pointerup', e => {
  //     if (startX !== null) {
  //       const dx = e.clientX - startX;
  //       if (Math.abs(dx) >= THRESHOLD) go(dx < 0);
  //     }
  //     startX = null;
  //   });

  //   document.querySelector('.facts-button-next')?.addEventListener('click', () => go(true));
  //   document.querySelector('.facts-button-prev')?.addEventListener('click', () => go(false));

  //   if (paginationEl) {
  //     paginationEl.addEventListener('click', e => {
  //       const bullet = e.target.closest('[data-index]');
  //       if (!bullet) return;
  //       const to = Number(bullet.dataset.index);
  //       if (!Number.isNaN(to)) goTo(to);
  //     });
  //   }

  //   swiper.slides[0]?.classList.add('s--active');
  //   swiper.slides[total() - 1]?.classList.add('s--prev');

  //   swiper.init();
  //   renderBullets();

  //   return swiper;
  // }

  // if (document.querySelector('.facts__slider')) {
  //   initClipSlider('.facts__slider');
  // }

  /**
   * Инициализация filled-класса для полей формы
   */
  (function () {
    const elements = document.querySelectorAll('.form-input, .form-search, .form-textarea');

    elements.forEach(element => {
      if (!element._filledInit) {
        element._filledInit = true;

        element.addEventListener('input', function () {
          this.classList.toggle('filled', this.value.trim() !== '');
        });
      }

      element.classList.toggle('filled', element.value.trim() !== '');
    })

  })();

  /**
   * ВЫПАДАЮЩИЙ СПИСОК (dropdown--js)
   *    
   * Кастомный select на основе radio-инпутов.
   * Открывается кликом, закрывается кликом вне или выбором опции.
   */
  (function () {
    document.addEventListener('click', (e) => {
      const selectedBtn = e.target.closest('.dropdown__selected--js');
      const currentDropdown = e.target.closest('.dropdown--js');
      const allDropdowns = document.querySelectorAll('.dropdown--js');

      const radioClick = e.target.closest('.dropdown__radio');

      if (radioClick && radioClick.checked && currentDropdown) {
        currentDropdown.classList.remove('is-active');
        return;
      }

      if (selectedBtn && currentDropdown) {
        e.stopPropagation();

        allDropdowns.forEach(dropdown => {
          if (dropdown !== currentDropdown) {
            dropdown.classList.remove('is-active');
          }
        });

        currentDropdown.classList.toggle('is-active');
        return;
      }

      allDropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('is-active');
        }
      });
    });

    document.addEventListener('change', (e) => {
      if (!e.target.classList.contains('dropdown__radio')) return;

      const radio = e.target;
      if (!radio.checked) return;

      const dropdown = radio.closest('.dropdown--js');
      if (!dropdown) return;

      const selectedInputJs = dropdown.querySelector('.dropdown__selected-input--js');
      const selectedLabelJs = dropdown.querySelector('.dropdown__selected-label--js');
      const dropdownValue = dropdown.querySelector('.dropdown__value');

      const value = radio.value;

      if (selectedLabelJs) selectedLabelJs.textContent = value;
      if (selectedInputJs) selectedInputJs.value = value;
      if (dropdownValue) dropdownValue.value = value;

      dropdown.classList.remove('is-active');

      // Проверяем, находится ли инпут внутри .dropdown__label--first или связан ли с ним
      const isFirst = radio.closest('.dropdown__label--first') || dropdown.querySelector(`label[for="${radio.id}"].dropdown__label--first`);

      if (isFirst) {
        dropdown.classList.remove('filled');
      } else {
        dropdown.classList.add('filled');
      }
    });
  })();

  (function () {
    document.addEventListener('click', (e) => {
      const clickedTab = e.target.closest('.general__tab');
      if (!clickedTab) return;

      const parentTabsContainer = clickedTab.closest('.general__tabs');
      if (!parentTabsContainer) return;

      if (clickedTab.classList.contains('is-active')) return;

      const allTabsInContainer = parentTabsContainer.querySelectorAll('.general__tab');
      allTabsInContainer.forEach(tab => tab.classList.remove('is-active'));

      clickedTab.classList.add('is-active');
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

  /**
   * УВЕДОМЛЕНИЕ О COOKIE                     
   *    
   * Показывает плашку если cookie COOKIE_ACCEPT ≠ '1'.            
   * checkCookies() вызывается из HTML при клике на кнопку.         
   */
  const cookieAccepted =
    ('; ' + document.cookie).split(`; COOKIE_ACCEPT=`).pop().split(';')[0] === '1';

  if (!cookieAccepted) {
    const cookiesNotify = document.getElementById('plate_cookie');
    if (cookiesNotify) {
      setTimeout(() => {
        cookiesNotify.classList.add('plate--active');
      }, 500);
    }
  }

});

/**
 * Принимает cookie и скрывает плашку уведомления.
 *
 * Устанавливает COOKIE_ACCEPT=1 сроком на 1 год.
 */
function checkCookies() {
  const expires = new Date(Date.now() + 86400e3 * 365).toUTCString();
  document.cookie = `COOKIE_ACCEPT=1;path=/;expires=${expires}`;

  const plate = document.getElementById('plate_cookie');
  if (!plate) return;
  plate.classList.remove('plate--active');

  setTimeout(() => plate.remove(), 5000);
}