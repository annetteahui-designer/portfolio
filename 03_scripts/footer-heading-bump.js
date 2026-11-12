(function () {
    // "Wanna chat?" in the footer — the first time it scrolls into view, "Wanna" bumps right
    // and settles back, then "chat?" does the same right after. Then it keeps replaying every
    // LOOP_DELAY_MS for as long as the heading stays on screen, pausing the moment it scrolls
    // out of view so it's never animating unseen.
    var BUMP_PX = 10;
    var BUMP_MS = 420;
    var GAP_MS = 120;
    var LOOP_DELAY_MS = 6000;

    document.addEventListener('DOMContentLoaded', function () {
        var heading = document.querySelector('[data-bump-heading]');

        if (!heading) {
            return;
        }

        var words = Array.prototype.slice.call(heading.querySelectorAll('.site-footer__sketch-heading-word'));
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || !words.length || !heading.animate) {
            return;
        }

        function bump(el) {
            return el.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(' + BUMP_PX + 'px)' },
                { transform: 'translateX(0)' }
            ], { duration: BUMP_MS, easing: 'ease-in-out' }).finished;
        }

        function playSequence() {
            return words.reduce(function (chain, el) {
                return chain.then(function () {
                    return bump(el);
                }).then(function () {
                    return new Promise(function (resolve) { setTimeout(resolve, GAP_MS); });
                });
            }, Promise.resolve());
        }

        if (!('IntersectionObserver' in window)) {
            playSequence();
            return;
        }

        var isVisible = false;
        var loopTimer = null;

        function scheduleNext() {
            loopTimer = setTimeout(function () {
                if (!isVisible) {
                    return;
                }

                playSequence().then(scheduleNext);
            }, LOOP_DELAY_MS);
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !isVisible) {
                    isVisible = true;
                    playSequence().then(scheduleNext);
                } else if (!entry.isIntersecting) {
                    isVisible = false;
                    clearTimeout(loopTimer);
                }
            });
        }, { threshold: 0.4 });

        observer.observe(heading);
    });
})();
