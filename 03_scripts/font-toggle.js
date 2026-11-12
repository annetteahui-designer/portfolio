(function () {
    // Dev toggle: lists every headline typeface tried so far (see styles.css's --font-display
    // and @font-face rules) instead of just flipping between two. Picking one sets
    // --font-display / --font-display-weight directly on <html> so every large headline
    // (anything using those tokens) updates live, site-wide, for this page view.
    var FONTS = {
        nimbus: { label: 'Nimbus', family: 'var(--font-primary)', weight: '400' },
        elizeth: { label: 'Elizeth', family: '"Elizeth", var(--font-primary)', weight: '400' },
        'elizeth-condensed': { label: 'Elizeth Condensed', family: '"Elizeth Condensed", var(--font-primary)', weight: '400' },
        'elizeth-light': { label: 'Elizeth Light', family: '"Elizeth", var(--font-primary)', weight: '300' },
        affairs: { label: 'Affairs', family: '"Affairs", var(--font-primary)', weight: '400' },
        'american-grotesk': { label: 'American Grotesk', family: '"American Grotesk", var(--font-primary)', weight: '400' },
        'nixie-one': { label: 'Nixie One', family: '"Nixie One", var(--font-primary)', weight: '400' },
        geist: { label: 'Geist', family: '"Geist", var(--font-primary)', weight: '400' },
        'ibm-plex-serif': { label: 'IBM Plex Serif', family: '"IBM Plex Serif", var(--font-primary)', weight: '400' }
    };

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('font-toggle');
        var menu = document.getElementById('font-menu');

        if (!toggle || !menu) {
            return;
        }

        var options = Array.prototype.slice.call(menu.querySelectorAll('[data-font]'));
        var root = document.documentElement;

        function apply(key) {
            var font = FONTS[key];

            if (!font) {
                return;
            }

            root.style.setProperty('--font-display', font.family);
            root.style.setProperty('--font-display-weight', font.weight);

            options.forEach(function (option) {
                option.classList.toggle('is-active', option.getAttribute('data-font') === key);
            });

            toggle.textContent = 'Font: ' + font.label;
        }

        function closeMenu() {
            menu.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = !menu.hidden;
            menu.hidden = isOpen;
            toggle.setAttribute('aria-expanded', String(!isOpen));
        });

        menu.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        document.addEventListener('click', closeMenu);

        options.forEach(function (option) {
            option.addEventListener('click', function () {
                apply(option.getAttribute('data-font'));
                closeMenu();
            });
        });
    });
})();
