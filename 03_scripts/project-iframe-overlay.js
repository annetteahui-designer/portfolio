(function () {
    // A glass overlay sits over a live, interactive iframe embed (e.g. the "Test 2" tab on
    // the IBM Research website section) so visitors don't land straight into someone else's
    // site. Clicking it fades the overlay out and away, after which the iframe underneath is
    // free to receive clicks/scroll normally.
    document.addEventListener('DOMContentLoaded', function () {
        var overlays = document.querySelectorAll('[data-iframe-overlay]');

        Array.prototype.forEach.call(overlays, function (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('is-dismissed');
            }, { once: true });
        });
    });
})();
