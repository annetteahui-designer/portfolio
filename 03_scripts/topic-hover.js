(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var items = document.querySelectorAll('.intro-strip__item[data-hover-text]');

        if (!items.length) {
            return;
        }

        // Mouse-only: no hover on a touch screen, so this circle never shows on tablet/mobile.
        if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        var cursor = document.createElement('div');
        cursor.className = 'topic-hover-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = '<div class="topic-hover-cursor__circle"><span class="topic-hover-cursor__label"></span></div>';
        document.body.appendChild(cursor);

        var label = cursor.querySelector('.topic-hover-cursor__label');

        function position(e) {
            cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
        }

        var circle = cursor.querySelector('.topic-hover-cursor__circle');
        var shapes = ['triangle', 'square', 'circle', 'rectangle', 'diamond'];
        var colors = ['green', 'blue', 'pink', 'yellow', 'orange'];

        items.forEach(function (item) {
            item.addEventListener('mouseenter', function (e) {
                label.textContent = item.getAttribute('data-hover-text');
                shapes.forEach(function (shape) { circle.classList.remove('topic-hover-cursor__circle--' + shape); });
                colors.forEach(function (color) { circle.classList.remove('topic-hover-cursor__circle--' + color); });
                var shape = item.getAttribute('data-hover-shape');
                var color = item.getAttribute('data-hover-color');
                if (shape) { circle.classList.add('topic-hover-cursor__circle--' + shape); }
                if (color) { circle.classList.add('topic-hover-cursor__circle--' + color); }
                position(e);
                cursor.classList.add('is-active');
                document.body.classList.add('hide-cursor-dot');
            });

            item.addEventListener('mousemove', position);

            item.addEventListener('mouseleave', function () {
                cursor.classList.remove('is-active');
                document.body.classList.remove('hide-cursor-dot');
            });
        });
    });
})();
