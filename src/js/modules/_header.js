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