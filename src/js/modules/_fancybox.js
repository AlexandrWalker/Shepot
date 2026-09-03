/**
 * Инициализация Fancybox
 */
Fancybox.bind('[data-fancybox]', {
  // Отключаем закрытие свайпом вниз
  dragToClose: false,
  closeExisting: true,
  // Отключаем жесты карусели (свайп влево/вправо)
  Carousel: {
    Panzoom: {
      // Отключаем pan (перетаскивание контента)
      panMode: 'mousemove',
      // или полностью:
      // touch: false,
    },
  },
  on: {
    init: () => lenis.stop(),
    destroy: () => lenis.start(),
  },
});