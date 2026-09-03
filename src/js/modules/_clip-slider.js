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