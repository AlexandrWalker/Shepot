(function () {
  const btnsContainer = document.querySelector('.menu__btns');
  if (!btnsContainer) return;

  const btns = btnsContainer.querySelectorAll('.menu__btn');
  const images = document.querySelectorAll('.menu__cover-img');
  if (!btns.length || !images.length) return;

  const clearActiveImages = () => {
    images.forEach(img => img.classList.remove('menu__cover-img--show'));
  };

  btns.forEach(btn => {
    const isBar = btn.classList.contains('menu__btn--bar');
    const isMain = btn.classList.contains('menu__btn--main');

    let targetSelector = '';
    if (isBar) targetSelector = '.menu__cover-img--bar';
    if (isMain) targetSelector = '.menu__cover-img--main';

    if (!targetSelector) return;

    btn.addEventListener('mouseenter', () => {
      const targetImg = document.querySelector(targetSelector);

      if (targetImg) {
        clearActiveImages();
        targetImg.classList.add('menu__cover-img--show');
      }
    });
  });
})();