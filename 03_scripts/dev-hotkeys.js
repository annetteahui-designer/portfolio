(function () {
    var KEY_TO_TOGGLE_ID = {
        g: 'grid-toggle',
        t: 'tokens-toggle',
        w: 'weight-toggle',
        r: 'reveal-toggle',
        m: 'measure-toggle',
        n: 'notes-toggle'
    };

    var VISIBLE_STORAGE_KEY = 'devUiVisible';

    // The toggle bar is hidden from every visitor by default (see styles.css); pressing D
    // reveals it and remembers that choice in localStorage, so it stays revealed across page
    // loads for whoever turned it on instead of needing D pressed again on every page. This
    // script runs at the end of body, so document.body already exists here.
    if (localStorage.getItem(VISIBLE_STORAGE_KEY) === '1') {
        document.body.classList.add('dev-ui-visible');
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.addEventListener('keydown', function (e) {
            if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'd') {
                var visible = document.body.classList.toggle('dev-ui-visible');
                localStorage.setItem(VISIBLE_STORAGE_KEY, visible ? '1' : '0');
                return;
            }

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
