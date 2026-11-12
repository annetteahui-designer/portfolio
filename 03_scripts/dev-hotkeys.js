(function () {
    var KEY_TO_TOGGLE_ID = {
        g: 'grid-toggle',
        t: 'tokens-toggle',
        w: 'weight-toggle',
        r: 'reveal-toggle',
        m: 'measure-toggle',
        n: 'notes-toggle'
    };

    document.addEventListener('DOMContentLoaded', function () {
        document.addEventListener('keydown', function (e) {
            if (e.metaKey || e.ctrlKey || e.altKey) {
                return;
            }

            var target = e.target;
            var tag = target && target.tagName;

            if (tag === 'INPUT' || tag === 'TEXTAREA' || (target && target.isContentEditable)) {
                return;
            }

            var key = e.key.toLowerCase();

            // H hides every dev tool at once — the toggle bar, any open panel, sticky notes —
            // without touching each tool's own on/off state, so pressing it again brings back
            // exactly what was showing before.
            if (key === 'h') {
                document.body.classList.toggle('dev-ui-hidden');
                return;
            }

            var toggleId = KEY_TO_TOGGLE_ID[key];

            if (!toggleId) {
                return;
            }

            var toggle = document.getElementById(toggleId);

            if (!toggle) {
                return;
            }

            toggle.click();
        });
    });
})();
