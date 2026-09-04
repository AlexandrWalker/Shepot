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