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

(function () {
  const isMobile = window.innerWidth < 600;
  if (isMobile) return;

  const animBlocks = document.querySelectorAll('.anim-block');
  if (!animBlocks.length) return;

  animBlocks.forEach(block => {
    gsap.fromTo(block,
      {
        y: 200,
        opacity: 0.1
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: block,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });
})();

(function () {
  const isMobile = window.innerWidth < 600;
  if (isMobile) return;

  const parallaxContainers = document.querySelectorAll('.parallax-container');
  if (!parallaxContainers.length) return;

  parallaxContainers.forEach(container => {
    const img = container.querySelector('img');
    if (!img) return;

    gsap.fromTo(img,
      {
        yPercent: -10,
        scale: 1.1
      },
      {
        yPercent: 10,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });
})();
