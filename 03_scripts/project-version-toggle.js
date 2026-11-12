(function () {
    // Version switch for pages that carry several layouts of the same content. The buttons
    // (data-version="v1|v2|v3|...", any number of them) set is-vN on the nearest
    // [data-versioned] container and the stylesheet shows the matching data-version="…-only"
    // blocks. v1 is always the implicit baseline — the stylesheet shows v1-only content
    // unless some other is-vN class is present, so v1 itself never needs a class. A container
    // can name its default with data-default-version (and start with that class in the
    // markup); the default is the plain URL, and any other choice is kept in the hash (#v2,
    // #v3, ...) so a version can be linked to and survives a refresh. The valid version set is
    // read from whatever buttons actually exist in this toggle, so adding a new V-button to
    // the markup (and its matching CSS) is the only step needed — nothing here is hardcoded
    // to a fixed count of versions.
    document.addEventListener('DOMContentLoaded', function () {
        var toggles = document.querySelectorAll('[data-version-toggle]');

        toggles.forEach(function (toggle) {
            var section = toggle.closest('[data-versioned]');
            var buttons = Array.prototype.slice.call(toggle.querySelectorAll('.project-version-toggle__option'));

            if (!section || !buttons.length) {
                return;
            }

            var defaultVersion = section.getAttribute('data-default-version') || 'v1';
            var allVersions = buttons.map(function (b) { return b.getAttribute('data-version'); });

            function show(version, updateHash) {
                buttons.forEach(function (b) {
                    var active = b.getAttribute('data-version') === version;
                    b.classList.toggle('is-active', active);
                    b.setAttribute('aria-pressed', String(active));
                });

                allVersions.forEach(function (v) {
                    if (v !== 'v1') {
                        section.classList.remove('is-' + v);
                    }
                });
                if (version !== 'v1') {
                    section.classList.add('is-' + version);
                }

                if (updateHash && window.history && history.replaceState) {
                    history.replaceState(null, '', version === defaultVersion ? location.pathname + location.search : '#' + version);
                }

                // sections measured while hidden (the V1 strips) re-measure on resize
                window.dispatchEvent(new Event('resize'));
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    show(button.getAttribute('data-version'), true);
                });
            });

            function fromHash() {
                var version = location.hash.replace('#', '');
                return allVersions.indexOf(version) !== -1 ? version : null;
            }

            if (fromHash()) {
                show(fromHash(), false);
            }

            // editing the hash by hand (or the back button) switches the layout too
            window.addEventListener('hashchange', function () {
                show(fromHash() || defaultVersion, false);
            });
        });
    });
})();
