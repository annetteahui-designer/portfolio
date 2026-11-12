(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var links = Array.prototype.slice.call(document.querySelectorAll('.project-toc__link'));

        if (!links.length || !('IntersectionObserver' in window)) {
            return;
        }

        // Current-section highlight — desktop only now (mobile has no .project-toc visible;
        // see mobile-toc-menu.js), but harmless to run everywhere since it just toggles a
        // class on links nothing is rendering below the breakpoint.
        var sections = links.map(function (link) {
            return document.getElementById(link.getAttribute('href').slice(1));
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var index = sections.indexOf(entry.target);

                if (index === -1) {
                    return;
                }

                links[index].classList.toggle('is-active', entry.isIntersecting);
            });
        }, { rootMargin: '-40% 0px -40% 0px' });

        sections.forEach(function (section) {
            if (section) {
                observer.observe(section);
            }
        });
    });
})();
