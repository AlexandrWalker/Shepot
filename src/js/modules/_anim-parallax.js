(function () {
  const isMobile = window.innerWidth < 600;
  if (isMobile) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const parallaxElements = document.querySelectorAll('.anim-parallax');
    if (!parallaxElements.length) return;

    parallaxElements.forEach(element => {
      const speedAttr = element.getAttribute('data-parallax-speed');
      const speed = speedAttr ? parseFloat(speedAttr) : 15;

      gsap.fromTo(element,
        { yPercent: speed },
        {
          yPercent: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });
  }
})();