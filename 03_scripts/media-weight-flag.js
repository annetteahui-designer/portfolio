(function () {
    var THRESHOLD_BYTES = 500 * 1024;

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('weight-toggle');

        if (!toggle) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isActive = document.body.classList.toggle('show-media-weight');
            toggle.classList.toggle('is-active', isActive);
            toggle.setAttribute('aria-pressed', String(isActive));

            if (isActive) {
                flagHeavyMedia();
            }
        });

        function flagHeavyMedia() {
            var media = document.querySelectorAll(
                '.project-media__image, .about__media-image, .mosaic__image'
            );

            media.forEach(function (el) {
                if (el.dataset.weightChecked) {
                    return;
                }
                el.dataset.weightChecked = 'true';

                var url = el.currentSrc || el.src;

                if (!url) {
                    return;
                }

                var entry = performance.getEntriesByName(url)[0];
                var size = entry ? (entry.transferSize || entry.encodedBodySize) : 0;

                if (size > THRESHOLD_BYTES) {
                    var wrapper = el.closest('.project-media, .about__media, .mosaic__media') || el.parentElement;

                    if (wrapper && !wrapper.querySelector('.media-weight-flag')) {
                        var dot = document.createElement('span');
                        dot.className = 'media-weight-flag';
                        dot.title = Math.round(size / 1024) + ' KB — consider optimizing';
                        wrapper.appendChild(dot);
                    }
                }
            });
        }
    });
})();
