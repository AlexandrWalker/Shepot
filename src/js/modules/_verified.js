(function () {
  const ALWAYS_ASK_MODE = true; 

  const STORAGE_KEY = 'age_verified_user';
  const popupElement = document.getElementById('age-verification-popup');
  const successBtn = document.getElementById('age-verify-success');
  const failBtn = document.getElementById('age-verify-fail');
  const popupWrap = document.querySelector('.popup-age__wrap');

  if (!popupElement || !successBtn || !failBtn || !popupWrap) return;

  let isSuccessClick = false;

  if (ALWAYS_ASK_MODE) {
    localStorage.removeItem(STORAGE_KEY);
  }

  const isVerified = localStorage.getItem(STORAGE_KEY);

  if (!isVerified) {
    if (typeof window.lenis !== 'undefined') window.lenis.stop();

    Fancybox.show(
      [{ src: '#age-verification-popup', type: 'inline' }],
      {
        closeButton: false,
        dragToClose: false,
        clickOutside: "none", 
        backdropClick: false,
        keyboard: {
          Escape: false,
          Delete: false,
          Backspace: false
        },
        on: {
          destroy: () => {
            if (isSuccessClick) {
              if (typeof window.lenis !== 'undefined') window.lenis.start();
              return;
            }

            const currentCheck = localStorage.getItem(STORAGE_KEY);
            if (!ALWAYS_ASK_MODE && currentCheck === 'true') {
              if (typeof window.lenis !== 'undefined') window.lenis.start();
              return;
            }

            if (typeof window.lenis !== 'undefined') window.lenis.stop();
            
            setTimeout(() => {
              Fancybox.show([{ src: '#age-verification-popup', type: 'inline' }], {
                closeButton: false, dragToClose: false, clickOutside: "none", backdropClick: false, keyboard: { Escape: false }
              });
            }, 10);
          }
        }
      }
    );
  }

  successBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    isSuccessClick = true;

    if (!ALWAYS_ASK_MODE) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }

    if (typeof window.lenis !== 'undefined') window.lenis.start();
    Fancybox.close();
  });

  failBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'https://google.com';
    }
  });
})();