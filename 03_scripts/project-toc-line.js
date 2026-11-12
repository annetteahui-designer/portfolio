(function () {
    // V2 of the Table of Contents: the sidebar's own vertical divider (border-right, see
    // .project-sidebar) only runs as tall as the sidebar's content box, so it stops right
    // after the last TOC link. This extends that same line down the page instead, its
    // bottom end held 48px above the bottom of the viewport — but never past the hairline
    // .project::after draws above the footer (bottom: 0 of .project), so on a short page or
    // once you've scrolled near the end, the line stops 48px above that hairline instead of
    // continuing to track the viewport bottom straight through the footer. Position is
    // measured rather than hardcoded so it stays aligned with the sidebar's right edge and
    // top at any viewport width, and tracks both while the page scrolls. Its length never
    // changes — only its left position, when the sidebar's own width animates (e.g.
    // project-sidebar-toggle.js's collapse/expand).
    var BOTTOM_GAP = 48;
    // matches .project__inner's `transition: grid-template-columns 0.4s ease` — how long to
    // keep re-measuring after a collapse/expand so the line's left edge tracks the sidebar's
    // animating right edge instead of jumping straight to the end state.
    var COLLAPSE_TRANSITION_MS = 400;

    function position(line, sidebar, section) {
        var r = sidebar.getBoundingClientRect();
        var bottom = window.innerHeight - BOTTOM_GAP;

        if (section) {
            var sectionBottom = section.getBoundingClientRect().bottom - BOTTOM_GAP;
            bottom = Math.min(bottom, sectionBottom);
        }

        line.style.left = r.right + 'px';
        line.style.top = r.top + 'px';
        line.style.height = Math.max(0, bottom - r.top) + 'px';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var lines = document.querySelectorAll('.project-toc__line');

        if (!lines.length) {
            return;
        }

        Array.prototype.forEach.call(lines, function (line) {
            var sidebar = line.closest('.project-sidebar');
            var section = line.closest('.project');

            if (!sidebar) {
                return;
            }

            var queued = false;

            function update() {
                queued = false;
                position(line, sidebar, section);
            }

            function queue() {
                if (queued) {
                    return;
                }
                queued = true;
                requestAnimationFrame(update);
            }

            // re-measures every frame for the duration of the collapse/expand transition, so
            // the line's left edge slides with the sidebar's animating width instead of
            // snapping to the end state only once the transition finishes.
            function trackTransition() {
                var start = performance.now();

                function tick(now) {
                    position(line, sidebar, section);
                    if (now - start < COLLAPSE_TRANSITION_MS) {
                        requestAnimationFrame(tick);
                    }
                }

                requestAnimationFrame(tick);
            }

            update();
            window.addEventListener('scroll', queue, { passive: true });
            window.addEventListener('resize', queue);
            sidebar.addEventListener('project-sidebar:toggle', trackTransition);
        });
    });
})();
