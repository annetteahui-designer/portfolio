(function () {
    // Smooth-scrolls to a section via [data-scroll-to="<id>"] without touching location.hash.
    // A plain href="#work" anchor jump changes the hash, which fires the version-toggle
    // script's hashchange listener (project-version-toggle.js) on every [data-versioned]
    // section on the page — including ones like the hero that have nothing to do with the
    // link's destination — resetting them to their default version. scrollIntoView gets the
    // same (already smooth, via the global scroll-behavior) scroll without that side effect.
    document.addEventListener('DOMContentLoaded', function () {
        var links = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-to]'));

        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var target = document.getElementById(link.getAttribute('data-scroll-to'));

                if (!target) {
                    return;
                }

                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    });
})();
