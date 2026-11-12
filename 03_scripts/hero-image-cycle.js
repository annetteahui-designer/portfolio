(function () {
    // Test: rotates a hero image through a set of alternates listed in its own
    // data-cycle-images (comma-separated paths) — a hard cut to each next frame, no fade.
    // Preloads every frame up front so the cut never shows a blank/loading flash.
    var INTERVAL_MS = 3500;

    document.addEventListener('DOMContentLoaded', function () {
        var images = document.querySelectorAll('[data-cycle-images]');

        if (!images.length) {
            return;
        }

        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        Array.prototype.forEach.call(images, function (img) {
            var frames = img.getAttribute('data-cycle-images').split(',').map(function (src) {
                return src.trim();
            }).filter(Boolean);

            if (frames.length < 2 || reduceMotion) {
                return;
            }

            frames.forEach(function (src) {
                var preload = new Image();
                preload.src = src;
            });

            var index = frames.indexOf(img.getAttribute('src'));
            if (index === -1) {
                index = 0;
            }

            setInterval(function () {
                index = (index + 1) % frames.length;
                img.src = frames[index];
            }, INTERVAL_MS);
        });
    });
})();
