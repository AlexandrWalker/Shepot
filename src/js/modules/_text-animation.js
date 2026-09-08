(function () {
  gsap.utils.toArray('[data-split="lines"]').forEach(container => {
    const targets = container.querySelectorAll('h1, h2, p');
    if (!targets.length) return;

    const isMobile = window.innerWidth < 600;

    gsap.fromTo(targets,
      {
        '--reveal-progress': '0%',
        y: '2.5rem',
        rotateX: -6,
        transformOrigin: 'top center'
      },
      {
        '--reveal-progress': '130%',
        y: '0rem',
        rotateX: 0,
        duration: isMobile ? 0.6 : 1.4,
        stagger: isMobile ? 0.12 : 0.22,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 90%',
          end: 'bottom top',
          toggleActions: 'play none none none'
        }
      }
    );
  });
})();

gsap.utils.toArray('[data-split="text"]').forEach(dataSplitText => {
  const isMobile = window.innerWidth < 600;
  const textSplit = dataSplitText.querySelectorAll('*');
  if (textSplit && !isMobile) SplitText.create(textSplit, {
    type: "words",
    aria: "hidden",
    onSplit: split => gsap.from(split.words, {
      opacity: 0,
      // duration: 0.3,
      duration: isMobile ? 0.2 : 0.5,
      // stagger: 0.05,
      stagger: isMobile ? 0.03 : 0.08,
      ease: "sine.out",
      scrollTrigger: {
        trigger: dataSplitText,
        start: "top 95%",
        end: "bottom top",
      }
    })
  });
});