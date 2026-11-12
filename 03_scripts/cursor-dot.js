(function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    document.addEventListener('DOMContentLoaded', function () {
        var dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dot);

        // Chrome-on-macOS-trackpad specific: Chrome's compositor can desync the real cursor
        // icon from cursor:none during ordinary trackpad pointer movement (confirmed via
        // screen recording — not just during scroll), leaving the system arrow visible
        // alongside this dot until something forces Chrome to recompute it. Flipping the
        // style off and back on every frame while the pointer moves forces that recompute
        // continuously instead of waiting on a scroll/wheel event; rAF-throttled so it runs
        // at most once per frame no matter how many mousemove events fire. Safari doesn't
        // have this bug but the extra flips are a harmless no-op there.
        var refreshQueued = false;

        function refreshCursor() {
            refreshQueued = false;
            document.documentElement.style.cursor = 'default';
            void document.documentElement.offsetHeight;
            document.documentElement.style.cursor = 'none';
        }

        function queueCursorRefresh() {
            if (refreshQueued) {
                return;
            }
            refreshQueued = true;
            requestAnimationFrame(refreshCursor);
        }

        document.addEventListener('mousemove', function (e) {
            dot.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
            dot.classList.add('is-active');
            queueCursorRefresh();
        });

        document.addEventListener('mouseleave', function () {
            dot.classList.remove('is-active');
        });

        window.addEventListener('scroll', refreshCursor, { passive: true });
        window.addEventListener('wheel', refreshCursor, { passive: true });
    });
})();
