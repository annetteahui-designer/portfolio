(function () {
    // Forces the embedded IBM Research site (Test / Test 2 panels) to always lay out at its
    // own 1584px desktop width — matching this site's own desktop content width — then
    // shrinks the rendered iframe back down with a CSS transform to fit whatever the frame's
    // actual width is. Setting the iframe's own width (not a wrapper's) is what makes the
    // embedded page's responsive CSS think it has a 1584px viewport; the transform only
    // changes how those already-laid-out pixels are painted, so the desktop layout holds at
    // both desktop and tablet widths. Below the mobile breakpoint this is skipped entirely —
    // the iframe sizes normally and the embedded site gets its own real mobile layout.
    var DESKTOP_WIDTH = 1584;
    var MOBILE_BREAKPOINT = 672;

    function apply(container) {
        var iframe = container.querySelector('.project-iframe-frame__frame');

        if (!iframe) {
            return;
        }

        if (window.innerWidth < MOBILE_BREAKPOINT) {
            iframe.style.width = '';
            iframe.style.height = '';
            iframe.style.transform = '';
            iframe.style.transformOrigin = '';
            return;
        }

        // clear any previous scale first so this measures the frame's real visible area,
        // not the fixed 1584px box left over from the last pass
        iframe.style.width = '';
        iframe.style.height = '';
        iframe.style.transform = '';

        var rect = iframe.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        var scale = rect.width / DESKTOP_WIDTH;

        iframe.style.width = DESKTOP_WIDTH + 'px';
        iframe.style.height = (rect.height / scale) + 'px';
        iframe.style.transform = 'scale(' + scale + ')';
        iframe.style.transformOrigin = 'top left';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var containers = document.querySelectorAll('.project-iframe-frame');

        if (!containers.length) {
            return;
        }

        if (!window.ResizeObserver) {
            Array.prototype.forEach.call(containers, apply);
            window.addEventListener('resize', function () {
                Array.prototype.forEach.call(containers, apply);
            });
            return;
        }

        // observing (not just a resize listener) means this also fires the moment a
        // hidden panel's tab is selected — [hidden] elements have no box to observe, so
        // the first real size shows up as a resize event once the panel becomes visible
        var observer = new ResizeObserver(function (entries) {
            entries.forEach(function (entry) {
                apply(entry.target);
            });
        });

        Array.prototype.forEach.call(containers, function (container) {
            observer.observe(container);
        });
    });
})();
