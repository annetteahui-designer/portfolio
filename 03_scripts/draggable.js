(function () {
    var DRAG_THRESHOLD = 4;

    function makeDraggable(handle, target) {
        if (!handle) {
            return;
        }

        target = target || handle;

        var pointerId = null;
        var startX = 0;
        var startY = 0;
        var startLeft = 0;
        var startTop = 0;
        var dragged = false;

        handle.addEventListener('pointerdown', function (e) {
            if (e.button !== undefined && e.button !== 0) {
                return;
            }

            if (e.target.closest && e.target.closest('button, a, input, select, textarea')) {
                return;
            }

            var rect = target.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            dragged = false;
            pointerId = e.pointerId;
            handle.setPointerCapture(pointerId);
        });

        handle.addEventListener('pointermove', function (e) {
            if (e.pointerId !== pointerId) {
                return;
            }

            var dx = e.clientX - startX;
            var dy = e.clientY - startY;

            if (!dragged && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
                return;
            }

            dragged = true;
            target.classList.add('is-dragging');

            var rect = target.getBoundingClientRect();
            var maxLeft = window.innerWidth - rect.width;
            var maxTop = window.innerHeight - rect.height;

            var left = Math.min(Math.max(startLeft + dx, 0), Math.max(maxLeft, 0));
            var top = Math.min(Math.max(startTop + dy, 0), Math.max(maxTop, 0));

            target.style.left = left + 'px';
            target.style.top = top + 'px';
            target.style.right = 'auto';
        });

        handle.addEventListener('pointerup', function (e) {
            if (e.pointerId !== pointerId) {
                return;
            }

            handle.releasePointerCapture(pointerId);
            target.classList.remove('is-dragging');
            pointerId = null;
        });

        handle.addEventListener('click', function (e) {
            if (dragged) {
                e.stopPropagation();
                e.preventDefault();
                dragged = false;
            }
        }, true);
    }

    window.makeDraggable = makeDraggable;
})();
