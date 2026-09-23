/**
 * УВЕДОМЛЕНИЕ О COOKIE                     
 *    
 * Показывает плашку если cookie COOKIE_ACCEPT ≠ '1'.            
 * checkCookies() вызывается из HTML при клике на кнопку.         
 */
const cookieAccepted =
  ('; ' + document.cookie).split(`; COOKIE_ACCEPT=`).pop().split(';')[0] === '1';

if (!cookieAccepted) {
  const cookiesNotify = document.getElementById('plate_cookie');
  if (cookiesNotify) {
    setTimeout(() => {
      cookiesNotify.classList.add('cookie--active');
    }, 500);
  }
}