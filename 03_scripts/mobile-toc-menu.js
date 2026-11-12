(function () {
    // Replaces the old dotted rail below 1056px: a glass hamburger button that appears in the
    // navbar's top-left corner the moment it goes glass (nav-scroll.js adds .is-minimal to
    // .navbar) — the same instant the logo that normally lives there fades out, so the button
    // reads as taking over that spot rather than competing with it. Tapping it opens a
    // dropdown built from the page's own .project-toc__link elements; the links are real
    // anchors, so the existing scroll-padding-top/scroll-behavior:smooth on <html> handles the
    // jump (and sticky-navbar offset) the same way the desktop Table of Contents already does.
    document.addEventListener('DOMContentLoaded', function () {
        var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.project-toc__link'));
        var navbar = document.querySelector('.navbar');

        if (!tocLinks.length || !navbar) {
            return;
        }

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'mobile-toc-menu__button';
        button.setAttribute('aria-label', 'Open table of contents');
        button.setAttribute('aria-expanded', 'false');
        button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">menu</span>';

        var panel = document.createElement('div');
        panel.className = 'mobile-toc-menu__panel';

        tocLinks.forEach(function (link) {
            var a = document.createElement('a');
            a.className = 'mobile-toc-menu__link';
            a.href = link.getAttribute('href');
            a.textContent = link.textContent.trim();
            panel.appendChild(a);
        });

        document.body.appendChild(button);
        document.body.appendChild(panel);

        function closePanel() {
            panel.classList.remove('is-open');
            button.setAttribute('aria-expanded', 'false');
        }

        button.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(open));
        });

        panel.addEventListener('click', function (e) {
            if (e.target.closest('.mobile-toc-menu__link')) {
                closePanel();
            }
        });

        document.addEventListener('click', function (e) {
            if (panel.classList.contains('is-open') && !panel.contains(e.target) && !button.contains(e.target)) {
                closePanel();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panel.classList.contains('is-open')) {
                closePanel();
                button.focus({ preventScroll: true });
            }
        });

        var mobileQuery = window.matchMedia('(max-width: 1055px)');

        function sync() {
            var visible = mobileQuery.matches && navbar.classList.contains('is-minimal');
            button.classList.toggle('is-visible', visible);

            if (!visible) {
                closePanel();
            }
        }

        new MutationObserver(sync).observe(navbar, { attributes: true, attributeFilter: ['class'] });
        mobileQuery.addEventListener('change', sync);
        sync();
    });
})();
