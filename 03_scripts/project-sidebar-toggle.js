(function () {
    // Desktop-only collapse for the project page sidebar (Table of Contents) — the arrow
    // button (.project-sidebar__toggle) on the heading row toggles .is-collapsed on
    // .project-sidebar, which hides the nav links and heading label and narrows the sidebar's
    // grid track to a slim rail (see styles.css); .project-content expands to fill the
    // reclaimed width via the same grid-template-columns transition.
    document.addEventListener('DOMContentLoaded', function () {
        var sidebar = document.querySelector('.project-sidebar');
        var toggle = document.querySelector('.project-sidebar__toggle');

        if (!sidebar || !toggle) {
            return;
        }

        function setCollapsed(collapsed) {
            sidebar.classList.toggle('is-collapsed', collapsed);
            toggle.setAttribute('aria-expanded', String(!collapsed));
            toggle.setAttribute('aria-label', collapsed ? 'Expand table of contents' : 'Collapse table of contents');
            // the sidebar's width animates via .project__inner's grid-template-columns
            // transition — let anything tracking the sidebar's edges (e.g. the V2 Table of
            // Contents divider) know a resize-like change just started.
            sidebar.dispatchEvent(new CustomEvent('project-sidebar:toggle', { bubbles: true }));
        }

        toggle.addEventListener('click', function () {
            setCollapsed(!sidebar.classList.contains('is-collapsed'));
        });
    });
})();
