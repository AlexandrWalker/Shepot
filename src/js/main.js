gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', () => {
  //=include modules/_preloader.js

  //=include modules/_header.js
  //=include modules/_burger.js

  // Анимации

  //=include modules/_block-animation.js

  // Функция магнитизма кнопок к курсору

  //=include modules/_magnetic.js

  // Слайдеры

  //=include modules/_clip-slider.js
  //=include modules/_afisha-slider.js

  // 
  
  //=include modules/_form-filled.js

  //=include modules/_sticky-reveal.js

  //=include modules/_menu-btns.js
  //=include modules/_fancybox.js

  window.addEventListener('resize', function () { ScrollTrigger.update() });
});