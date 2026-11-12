(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var carousels = document.querySelectorAll('img[data-carousel]');

        carousels.forEach(function (img) {
            var images;

            try {
                images = JSON.parse(img.getAttribute('data-images'));
            } catch (e) {
                return;
            }

            if (!images || !images.length) {
                return;
            }

            var interval = parseInt(img.getAttribute('data-interval'), 10) || 1000;
            var index = 0;

            setInterval(function () {
                index = (index + 1) % images.length;
                img.src = images[index];
            }, interval);
        });
    });
})();
