/**
 * Анимация блоков
 */
(function () {
  const isMobile = window.innerWidth < 600;

  if (!isMobile) {
    const animItems = document.querySelectorAll('.anim-items')
    animItems.forEach(items => {
      const item = items.querySelectorAll('.anim-item')
      gsap.from(item, {
        scale: 0.8,
        opacity: 0,

        stagger: {
          each: 0.3, // задержка между каждым айтемом
          from: "start"
        },

        duration: 1,
        ease: "back.out(1.7)",

        scrollTrigger: {
          trigger: items,
          start: "top 50%",
          onEnter: () => items.classList.add('anim-animated'),
        }
      });
    });
  }
})();