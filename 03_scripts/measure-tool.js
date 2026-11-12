(function () {
    // Same rhythm as --spacing-01..13 in styles.css — any measured distance that
    // doesn't land on one of these (within a hairline rounding tolerance) gets
    // flagged as off-scale instead of silently rendered as "correct".
    var SPACING_SCALE = [2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160];
    var TOLERANCE = 0.5;

    var IGNORE_SELECTOR = [
        '.dev-toggles',
        '#grid-overlay',
        '#tokens-panel',
        '.cursor-dot',
        '.measure-highlight',
        '.measure-label',
        '.measure-distance-line',
        '.measure-distance-label',
        '.reveal-filenames-overlay'
    ].join(', ');

    function isOnScale(px) {
        return SPACING_SCALE.some(function (step) {
            return Math.abs(px - step) <= TOLERANCE;
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('measure-toggle');

        if (!toggle) {
            return;
        }

        var active = false;
        var dragging = false;
        var dragStart = null;

        var highlight = document.createElement('div');
        highlight.className = 'measure-highlight';
        highlight.setAttribute('aria-hidden', 'true');

        var label = document.createElement('div');
        label.className = 'measure-label';
        label.setAttribute('aria-hidden', 'true');

        var lineX = document.createElement('div');
        lineX.className = 'measure-distance-line measure-distance-line--x';
        lineX.setAttribute('aria-hidden', 'true');

        var lineY = document.createElement('div');
        lineY.className = 'measure-distance-line measure-distance-line--y';
        lineY.setAttribute('aria-hidden', 'true');

        var labelX = document.createElement('div');
        labelX.className = 'measure-distance-label';
        labelX.setAttribute('aria-hidden', 'true');

        var labelY = document.createElement('div');
        labelY.className = 'measure-distance-label';
        labelY.setAttribute('aria-hidden', 'true');

        function elementAt(x, y) {
            var stack = document.elementsFromPoint(x, y);

            for (var i = 0; i < stack.length; i++) {
                var el = stack[i];

                if (el === document.documentElement || el === document.body) {
                    continue;
                }

                if (el.closest(IGNORE_SELECTOR)) {
                    continue;
                }

                return el;
            }

            return null;
        }

        function placeLabel(el, rect) {
            el.style.top = (rect.top > 24 ? rect.top - 22 : rect.bottom + 6) + 'px';
            el.style.left = Math.max(4, rect.left) + 'px';
        }

        function showHighlight(rect) {
            highlight.style.top = rect.top + 'px';
            highlight.style.left = rect.left + 'px';
            highlight.style.width = rect.width + 'px';
            highlight.style.height = rect.height + 'px';
            highlight.style.display = 'block';

            label.textContent = Math.round(rect.width) + ' × ' + Math.round(rect.height);
            placeLabel(label, rect);
            label.style.display = 'block';
        }

        function hideHover() {
            highlight.style.display = 'none';
            label.style.display = 'none';
        }

        // draws an "L" shaped ruler between two dragged points — a horizontal leg
        // at the start point's height and a vertical leg at the end point's x —
        // same visual language design tools use for an option/alt-drag measurement
        function updateRuler(x1, y1, x2, y2) {
            var dx = Math.abs(x2 - x1);
            var dy = Math.abs(y2 - y1);

            if (dx > 0) {
                lineX.style.top = y1 + 'px';
                lineX.style.left = Math.min(x1, x2) + 'px';
                lineX.style.width = dx + 'px';
                lineX.style.height = '';
                lineX.style.display = 'block';

                labelX.style.top = (y1 - 20) + 'px';
                labelX.style.left = (Math.min(x1, x2) + dx / 2 - 14) + 'px';
                labelX.classList.toggle('is-off-scale', !isOnScale(dx));
                labelX.textContent = (isOnScale(dx) ? '' : '⚠ ') + Math.round(dx) + 'px';
                labelX.style.display = 'block';
            } else {
                lineX.style.display = 'none';
                labelX.style.display = 'none';
            }

            if (dy > 0) {
                lineY.style.left = x2 + 'px';
                lineY.style.top = Math.min(y1, y2) + 'px';
                lineY.style.height = dy + 'px';
                lineY.style.width = '';
                lineY.style.display = 'block';

                labelY.style.top = (Math.min(y1, y2) + dy / 2 - 9) + 'px';
                labelY.style.left = (x2 + 6) + 'px';
                labelY.classList.toggle('is-off-scale', !isOnScale(dy));
                labelY.textContent = (isOnScale(dy) ? '' : '⚠ ') + Math.round(dy) + 'px';
                labelY.style.display = 'block';
            } else {
                lineY.style.display = 'none';
                labelY.style.display = 'none';
            }
        }

        function onMouseMove(e) {
            if (dragging) {
                updateRuler(dragStart.x, dragStart.y, e.clientX, e.clientY);
                hideHover();
                return;
            }

            var el = elementAt(e.clientX, e.clientY);

            if (!el) {
                hideHover();
                return;
            }

            showHighlight(el.getBoundingClientRect());
        }

        function onMouseDown(e) {
            if (e.target.closest(IGNORE_SELECTOR)) {
                return;
            }

            e.preventDefault();
            dragging = true;
            dragStart = { x: e.clientX, y: e.clientY };
            hideHover();
        }

        function onMouseUp() {
            dragging = false;
        }

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                dragging = false;
                lineX.style.display = 'none';
                lineY.style.display = 'none';
                labelX.style.display = 'none';
                labelY.style.display = 'none';
            }
        }

        function activate() {
            document.body.appendChild(highlight);
            document.body.appendChild(label);
            document.body.appendChild(lineX);
            document.body.appendChild(lineY);
            document.body.appendChild(labelX);
            document.body.appendChild(labelY);

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mousedown', onMouseDown, true);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('keydown', onKeyDown);
        }

        function deactivate() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown, true);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('keydown', onKeyDown);

            dragging = false;
            [highlight, label, lineX, lineY, labelX, labelY].forEach(function (el) {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        }

        toggle.addEventListener('click', function () {
            active = !active;
            toggle.classList.toggle('is-active', active);
            toggle.setAttribute('aria-pressed', String(active));
            document.body.classList.toggle('is-measuring', active);

            if (active) {
                activate();
            } else {
                deactivate();
            }
        });
    });
})();
