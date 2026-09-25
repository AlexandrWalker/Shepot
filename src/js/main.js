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

  //=include modules/_dropdown.js

  // Попап

  //=include modules/_popup.js

  //=include modules/_menu-btns.js
  //=include modules/_fancybox.js
  //=include modules/_verified.js

  window.addEventListener('resize', function () { ScrollTrigger.update() });

  //=include modules/_cookie.js
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
  plate.classList.remove('cookie--active');

  setTimeout(() => plate.remove(), 5000);
}