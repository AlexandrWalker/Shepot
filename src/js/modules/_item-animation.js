(function () {
  const isMobile = window.innerWidth < 600;
  if (isMobile) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const section = document.querySelector('.unique');
    const items = document.querySelectorAll('.unique__item');
    if (!section || items.length < 3) return;

    gsap.fromTo(items[0],
      { rotateY: -15, rotateX: 5, yPercent: -10 },
      { rotateY: 10, rotateX: -5, yPercent: 10, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } }
    );

    gsap.fromTo(items[1],
      { rotateX: 10, scale: 0.95 },
      { rotateX: -10, scale: 1.02, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } }
    );

    gsap.fromTo(items[2],
      { rotateY: 15, rotateX: -5, yPercent: 15 },
      { rotateY: -10, rotateX: 5, yPercent: -15, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } }
    );
  }
})();