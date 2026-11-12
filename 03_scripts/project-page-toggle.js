(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var toggles = document.querySelectorAll('[data-page-toggle]');

        toggles.forEach(function (toggle) {
            var buttons = Array.prototype.slice.call(toggle.querySelectorAll('.project-version-toggle__option'));
            var grid = toggle.nextElementSibling;
            var panels = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-page-panel]')) : [];

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var page = button.getAttribute('data-page');

                    buttons.forEach(function (b) {
                        b.classList.toggle('is-active', b === button);
                    });

                    panels.forEach(function (panel) {
                        panel.hidden = panel.getAttribute('data-page-panel') !== page;
                    });
                });
            });
        });
    });
})();
