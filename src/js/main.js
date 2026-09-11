gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', () => {
  //=include modules/_preloader.js

  //=include modules/_header.js
  //=include modules/_burger.js

  // Анимации

  //=include modules/_block-animation.js
  //=include modules/_text-animation.js
  //=include modules/_item-animation.js
  //=include modules/_anim-parallax.js

  // Функция магнитизма кнопок к курсору

  //=include modules/_magnetic.js

  // Пульсация link

  //=include modules/_pulse.js

  // Слайдеры

  //=include modules/_clip-slider.js
  //=include modules/_afisha-slider.js

  // 
  
  //=include modules/_form-filled.js

  //=include modules/_sticky-reveal.js

  // Попап
  
  //=include modules/_popup.js

  //=include modules/_menu-btns.js
  //=include modules/_fancybox.js

  window.addEventListener('resize', function () { ScrollTrigger.update() });
});