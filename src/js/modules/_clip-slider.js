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