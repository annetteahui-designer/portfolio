(function () {
    // Wait for the full 'load' event, not DOMContentLoaded — measure() reads each
    // item's rendered width, which for images/video is only correct once their
    // intrinsic dimensions have actually downloaded. Measuring earlier silently
    // treats still-loading media as 0px wide and corrupts the offset math.
    window.addEventListener('load', function () {
        var strips = document.querySelectorAll('.paged-strip');

        strips.forEach(function (strip) {
            var viewport = strip.querySelector('.paged-strip__viewport');
            var track = strip.querySelector('.paged-strip__track');
            var items = Array.prototype.slice.call(track.children);
            var widths = [];
            var offsets = [];
            var containerWidth = 0;
            var startIndex = 0;

            var prevButton = strip.querySelector('.paged-strip__arrow--prev');
            var nextButton = strip.querySelector('.paged-strip__arrow--next');
            var count = strip.querySelector('.paged-strip__count');

            function measure() {
                if (!items.length) {
                    return;
                }

                var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
                widths = items.map(function (item) {
                    return item.getBoundingClientRect().width;
                });
                containerWidth = strip.getBoundingClientRect().width;

                offsets = [];
                var offset = 0;
                for (var i = 0; i < widths.length; i++) {
                    offsets.push(offset);
                    offset += widths[i] + gap;
                }

                if (startIndex > items.length - 1) {
                    startIndex = items.length - 1;
                }
            }

            function render(skipTransition) {
                if (skipTransition) {
                    track.style.transition = 'none';
                    viewport.style.transition = 'none';
                }

                // peek: every position but the last opens to the full container width
                // so the next item's edge bleeds in and gets clipped, Netflix-row style.
                var isLastItem = startIndex === items.length - 1;
                viewport.style.width = (isLastItem ? widths[startIndex] : containerWidth) + 'px';
                track.style.transform = 'translateX(-' + offsets[startIndex] + 'px)';

                if (skipTransition) {
                    void track.offsetWidth;
                    track.style.transition = '';
                    viewport.style.transition = '';
                }

                if (count) {
                    count.textContent = (startIndex + 1) + ' / ' + items.length;
                }
            }

            if (prevButton) {
                prevButton.addEventListener('click', function () {
                    var wrapping = startIndex === 0;
                    startIndex = (startIndex - 1 + items.length) % items.length;
                    render(wrapping);
                });
            }

            if (nextButton) {
                nextButton.addEventListener('click', function () {
                    var wrapping = startIndex === items.length - 1;
                    startIndex = (startIndex + 1) % items.length;
                    render(wrapping);
                });
            }

            window.addEventListener('resize', function () {
                measure();
                render(true);
            });

            measure();
            render(true);
        });
    });
})();
