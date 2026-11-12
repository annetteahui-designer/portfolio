(function () {
    // Fades/rises [data-reveal] elements into place the first time they scroll into view —
    // homepage project cards, project-page media. Staggers whatever enters together in one
    // IntersectionObserver batch (an on-load viewport's worth, or a scroll flinging several in
    // at once) so they cascade rather than all snap in at exactly the same instant.
    var STAGGER_MS = 70;

    document.addEventListener('DOMContentLoaded', function () {
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

        if (!items.length) {
            return;
        }

        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-revealed'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            var batchIndex = 0;

            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.style.transitionDelay = (batchIndex * STAGGER_MS) + 'ms';
                batchIndex++;
                entry.target.classList.add('is-revealed');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        items.forEach(function (el) { observer.observe(el); });
    });
})();
