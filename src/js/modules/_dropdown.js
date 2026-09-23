/**
 * ВЫПАДАЮЩИЙ СПИСОК (dropdown--js)
 *    
 * Кастомный select на основе radio-инпутов.
 * Открывается кликом, закрывается кликом вне или выбором опции.
 */
(function () {
  document.addEventListener('click', (e) => {
    const selectedBtn = e.target.closest('.dropdown__selected--js');
    const currentDropdown = e.target.closest('.dropdown--js');
    const allDropdowns = document.querySelectorAll('.dropdown--js');

    const radioClick = e.target.closest('.dropdown__radio');

    if (radioClick && radioClick.checked && currentDropdown) {
      currentDropdown.classList.remove('is-active');
      return;
    }

    if (selectedBtn && currentDropdown) {
      e.stopPropagation();

      allDropdowns.forEach(dropdown => {
        if (dropdown !== currentDropdown) {
          dropdown.classList.remove('is-active');
        }
      });

      currentDropdown.classList.toggle('is-active');
      return;
    }

    allDropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-active');
      }
    });
  });

  document.addEventListener('change', (e) => {
    if (!e.target.classList.contains('dropdown__radio')) return;

    const radio = e.target;
    if (!radio.checked) return;

    const dropdown = radio.closest('.dropdown--js');
    if (!dropdown) return;

    const selectedInputJs = dropdown.querySelector('.dropdown__selected-input--js');
    const selectedLabelJs = dropdown.querySelector('.dropdown__selected-label--js');
    const dropdownValue = dropdown.querySelector('.dropdown__value');

    const value = radio.value;

    if (selectedLabelJs) selectedLabelJs.textContent = value;
    if (selectedInputJs) selectedInputJs.value = value;
    if (dropdownValue) dropdownValue.value = value;

    dropdown.classList.remove('is-active');

    // Проверяем, находится ли инпут внутри .dropdown__label--first или связан ли с ним
    const isFirst = radio.closest('.dropdown__label--first') || dropdown.querySelector(`label[for="${radio.id}"].dropdown__label--first`);

    if (isFirst) {
      dropdown.classList.remove('filled');
    } else {
      dropdown.classList.add('filled');
    }
  });
})();