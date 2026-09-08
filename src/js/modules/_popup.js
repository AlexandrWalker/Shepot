(function () {
  const showClass = 'popup--show';

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-popup]');

    if (trigger) {
      if (e.target.closest('a') || e.target.closest('button')) {
        if (!trigger.hasAttribute('href')) e.preventDefault();
      }

      const popupId = trigger.dataset.popup;
      const targetPopup = document.getElementById(popupId);

      if (targetPopup) {
        targetPopup.classList.add(showClass);
        if (typeof lenis !== 'undefined') lenis.stop();
      }
      return;
    }

    const closeBtn = e.target.closest('.popup__close');
    if (closeBtn) {
      const activePopup = closeBtn.closest('.popup');
      if (activePopup) {
        activePopup.classList.remove(showClass);
        if (typeof lenis !== 'undefined') lenis.start();
      }
      return;
    }

    const overlayPopup = e.target.closest('.popup');
    if (overlayPopup) {
      const isInsideContent = e.target.closest('.popup__wrap');
      if (!isInsideContent) {
        overlayPopup.classList.remove(showClass);
        if (typeof lenis !== 'undefined') lenis.start();
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activePopup = document.querySelector(`.popup.${showClass}`);
      if (activePopup) {
        activePopup.classList.remove(showClass);
        if (typeof lenis !== 'undefined') lenis.start();
      }
    }
  });
})();