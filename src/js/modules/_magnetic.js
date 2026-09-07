(function () {
  const magneticButtons = document.querySelectorAll('.magnetic');
  if (!magneticButtons.length) return;

  const mediaQuery = window.matchMedia('(max-width: 600px)');

  magneticButtons.forEach((button) => {
    const magnetic__hit = button.querySelector('.magnetic__hit');
    const magnetic_inner = button.querySelector('.magnetic__inner');
    const magnetic_text = button.querySelector('.magnetic__text');

    if (!magnetic__hit || !magnetic_inner) return;

    let isFirstEnter = false;

    const handleMouseEnter = () => {
      if (mediaQuery.matches) return;
      isFirstEnter = true;
    };

    // Функция ведения магнита за курсором
    const handleMouseMove = (e) => {
      if (mediaQuery.matches) return;

      const position = button.getBoundingClientRect();

      const x = e.clientX - (position.left + position.width / 2);
      const y = e.clientY - (position.top + position.height / 2);

      const currentDuration = isFirstEnter ? 1.2 : 0.8;
      const currentEase = isFirstEnter ? "power2.out" : "power3.out";

      gsap.to(magnetic_inner, {
        x: x * 0.3,
        y: y * 0.4,
        duration: currentDuration,
        ease: currentEase,
        overwrite: "auto",
        onStart: () => {
          isFirstEnter = false;
        }
      });

      if (magnetic_text) {
        gsap.to(magnetic_text, {
          x: x * 0.12,
          y: y * 0.15,
          scale: 1.05,
          duration: currentDuration,
          ease: currentEase,
          overwrite: "auto"
        });
      }
    };

    const handleMouseLeave = () => {
      if (mediaQuery.matches) return;

      gsap.to(magnetic_inner, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto"
      });

      if (magnetic_text) {
        gsap.to(magnetic_text, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
          overwrite: "auto"
        });
      }
    };

    magnetic__hit.addEventListener('mouseenter', handleMouseEnter);
    magnetic__hit.addEventListener('mousemove', handleMouseMove);
    magnetic__hit.addEventListener('mouseleave', handleMouseLeave);

    const handleReset = (e) => {
      if (e.matches) {
        gsap.killTweensOf([magnetic_inner, magnetic_text]);
        if (magnetic_inner) magnetic_inner.style.transform = '';
        if (magnetic_text) magnetic_text.style.transform = '';
      }
    };

    try {
      mediaQuery.addEventListener('change', handleReset);
    } catch (err) {
      mediaQuery.addListener(handleReset);
    }
  });
})();