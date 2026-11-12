(function () {
    var AUTO_ADVANCE_MS = 4000;

    document.addEventListener('DOMContentLoaded', function () {
        var letters = Array.prototype.slice.call(document.querySelectorAll('.hero__letter-a'));
        var dot = document.querySelector('.hero__list-dot');
        var items = Array.prototype.slice.call(document.querySelectorAll('.intro-strip__item'));

        if (!letters.length || !dot || !items.length) {
            return;
        }

        var current = 0;
        var timer = null;

        function positionDot() {
            var target = items[current % items.length];
            dot.style.top = (target.offsetTop + target.offsetHeight / 2) + 'px';
        }

        function setActive(index) {
            letters[current].classList.remove('is-active');

            current = index;

            letters[current].classList.add('is-active');

            positionDot();
        }

        function advance() {
            setActive((current + 1) % letters.length);
        }

        function restartAutoAdvance() {
            clearInterval(timer);
            timer = setInterval(advance, AUTO_ADVANCE_MS);
        }

        window.addEventListener('resize', positionDot);

        positionDot();
        restartAutoAdvance();
    });
})();
