(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var navbar = document.querySelector('.navbar');

        if (!navbar) {
            return;
        }

        // homepage: go glass while #work is centered in view.
        // project pages have no #work — instead go glass once the reader scrolls
        // past #intro (i.e. #intro is no longer centered), staying glass for the
        // rest of the page until they scroll back up into it.
        //
        // A page can carry several layouts and show one at a time (the Playground's V1/V2/V3, each
        // inside a [data-versioned] container). Those mark their section with data-nav-work
        // (watched like #work) or data-nav-intro (watched like #intro), and only the one
        // that is actually on screen counts — the watcher is rebuilt when the layout changes.
        var observer = null;
        var scrollHandler = null;

        function visible(el) {
            return !!el && el.getClientRects().length > 0;
        }

        function pickTarget() {
            var candidates = [
                { el: document.getElementById('work'), invert: false },
                { el: document.querySelector('[data-nav-work]'), invert: false },
                { el: document.getElementById('intro'), invert: true },
                { el: document.querySelector('[data-nav-intro]'), invert: true }
            ];

            // the layout that is on screen may not be the first match, so check them all
            var all = [];
            document.querySelectorAll('#work, [data-nav-work]').forEach(function (el) { all.push({ el: el, invert: false }); });
            document.querySelectorAll('#intro, [data-nav-intro]').forEach(function (el) { all.push({ el: el, invert: true }); });

            for (var i = 0; i < all.length; i++) {
                if (visible(all[i].el)) {
                    return all[i];
                }
            }

            // nothing visible (yet): fall back to the first one the page has
            return candidates.filter(function (c) { return c.el; })[0] || null;
        }

        function setup() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }

            if (scrollHandler) {
                window.removeEventListener('scroll', scrollHandler);
                scrollHandler = null;
            }

            var picked = pickTarget();

            // pages with no section to watch (the About page) can opt in to a plain scroll-distance
            // trigger: data-glass-after="40" goes glass once the reader is 40px down
            var glassAfter = parseFloat(navbar.getAttribute('data-glass-after'));

            if (!picked && glassAfter >= 0) {
                scrollHandler = function () {
                    navbar.classList.toggle('is-minimal', window.scrollY > glassAfter);
                };

                window.addEventListener('scroll', scrollHandler, { passive: true });
                scrollHandler();
                return;
            }

            if (!picked) {
                return;
            }

            var invert = picked.invert;

            // project pages: center-crossing assumes #intro is tall enough to span the
            // viewport's center at scroll 0 — short intros (e.g. Playground, no hero media)
            // never reach it, so the navbar would go glass immediately on load instead of
            // once the reader actually scrolls past. Use a top-edge crossing instead, which
            // works regardless of #intro's height.
            var options = invert
                ? { threshold: 0, rootMargin: '-' + navbar.offsetHeight + 'px 0px 0px 0px' }
                : { threshold: 0, rootMargin: '-50% 0px -50% 0px' };

            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var isMinimal = invert ? !entry.isIntersecting : entry.isIntersecting;
                    navbar.classList.toggle('is-minimal', isMinimal);
                });
            }, options);

            observer.observe(picked.el);
        }

        setup();

        // rebuild when a versioned page switches layout (the version buttons toggle a class)
        document.querySelectorAll('[data-versioned]').forEach(function (container) {
            new MutationObserver(function () {
                navbar.classList.remove('is-minimal');
                setup();
            }).observe(container, { attributes: true, attributeFilter: ['class'] });
        });
    });
})();
