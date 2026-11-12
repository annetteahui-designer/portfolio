(function () {
    var AUTO_ADVANCE_MS = 4000;

    document.addEventListener('DOMContentLoaded', function () {
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero__pagination-dot'));
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
        var captions = Array.prototype.slice.call(document.querySelectorAll('.hero__feature-caption'));
        var track = document.querySelector('.hero__slides-track');
        var fill = document.querySelector('.hero__pagination-fill');

        if (!dots.length) {
            return;
        }

        var current = dots.findIndex(function (dot) {
            return dot.classList.contains('is-active');
        });

        if (current === -1) {
            current = 0;
        }

        var timer = null;

        function setActive(index) {
            dots[current].classList.remove('is-active');
            dots[current].setAttribute('aria-selected', 'false');

            if (slides[current]) {
                slides[current].classList.remove('is-active');
                slides[current].setAttribute('aria-hidden', 'true');
            }

            if (captions[current]) {
                captions[current].classList.remove('is-active');
                captions[current].setAttribute('aria-hidden', 'true');
            }

            current = index;

            dots[current].classList.add('is-active');
            dots[current].setAttribute('aria-selected', 'true');

            if (slides[current]) {
                slides[current].classList.add('is-active');
                slides[current].setAttribute('aria-hidden', 'false');
            }

            if (captions[current]) {
                captions[current].classList.add('is-active');
                captions[current].setAttribute('aria-hidden', 'false');
            }

            if (track) {
                track.style.transform = 'translateX(-' + (current * (100 / slides.length)) + '%)';
            }

            startFill();
        }

        function advance() {
            setActive((current + 1) % dots.length);
        }

        function startFill() {
            if (!fill) {
                return;
            }

            fill.classList.remove('is-filling');
            fill.style.transitionDuration = '0ms';
            fill.style.width = '0%';

            // force reflow so the reset above is committed before the fill transition starts
            void fill.offsetWidth;

            fill.classList.add('is-filling');
            fill.style.transitionDuration = AUTO_ADVANCE_MS + 'ms';
            fill.style.width = '100%';
        }

        function restartAutoAdvance() {
            clearInterval(timer);
            timer = setInterval(advance, AUTO_ADVANCE_MS);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setActive(index);
                restartAutoAdvance();
            });
        });

        startFill();
        restartAutoAdvance();
    });
})();
