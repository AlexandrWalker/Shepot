var afishaSlider = new Swiper('.afisha__slider', {
  slidesPerGroup: 1,
  slidesPerView: 1,
  spaceBetween: 20,
  centeredSlides: true,
  grabCursor: true,
  loop: true,
  slideToClickedSlide: true,
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