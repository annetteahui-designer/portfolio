(function () {
    // Dev toggle: previews a type-scale bump (12px -> 14px, 16px -> 20px) applied everywhere
    // those tokens are used, without committing to it. See .is-type-bumped in styles.css.
    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('type-scale-toggle');

        if (!toggle) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isActive = document.body.classList.toggle('is-type-bumped');
            toggle.classList.toggle('is-active', isActive);
            toggle.setAttribute('aria-pressed', String(isActive));
        });
    });
})();
