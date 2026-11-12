(function () {
    // Plays a one-shot bounce on [data-scroll-bounce] elements the moment they cross the
    // vertical centre of the viewport while scrolling — not just "comes into view" like
    // scroll-reveal.js, but the exact midpoint. Shrinking the observer's root to a single line
    // at 50% (via a -50%/-50% rootMargin) makes isIntersecting flip true at that instant.
    document.addEventListener('DOMContentLoaded', function () {
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-bounce]'));

        if (!items.length) {
            return;
        }

        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-bouncing');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0, rootMargin: '-50% 0px -50% 0px' });

        items.forEach(function (el) { observer.observe(el); });
    });
})();
