(function () {
  const activeClass = 'events__item--active';

  const isMobile = () => window.innerWidth < 600;

  document.addEventListener('click', (e) => {
    if (!isMobile()) return;

    const currentItem = e.target.closest('.events__item');

    if (!currentItem) {
      if (!e.target.closest('.events__item')) {
        document.querySelectorAll('.events__item').forEach(item => {
          item.classList.remove(activeClass);
        });
      }
      return;
    }

    if (e.target.closest('a') || e.target.closest('button')) return;

    e.preventDefault();

    const isCurrentActive = currentItem.classList.contains(activeClass);

    document.querySelectorAll('.events__item').forEach(item => {
      item.classList.remove(activeClass);
    });

    if (!isCurrentActive) {
      currentItem.classList.add(activeClass);
    }
  });
})();