/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'ShepotIconFont\'">' + entity + '</span>' + html;
	}
	var icons = {
		'icon-arrow-right': '&#xe900;',
		'icon-chevron-down': '&#xe901;',
		'icon-chevron-right': '&#xe902;',
		'icon-download': '&#xe903;',
		'icon-mail-social': '&#xe904;',
		'icon-max': '&#xe905;',
		'icon-max-social': '&#xe906;',
		'icon-plus': '&#xe907;',
		'icon-tg': '&#xe908;',
		'icon-tg-social': '&#xe909;',
		'icon-wa': '&#xe90a;',
		'icon-wa-social': '&#xe90b;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
