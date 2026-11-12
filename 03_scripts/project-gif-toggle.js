(function () {
    var durationCache = {};

    function skipSubBlocks(bytes, pos) {
        while (bytes[pos] !== 0x00) {
            pos += bytes[pos] + 1;
        }
        return pos + 1;
    }

    // Reads a gif's own frame delays so it can be auto-stopped after exactly one loop
    // instead of guessing a fixed timeout that would be wrong for most files.
    function getGifLoopDuration(url) {
        if (durationCache[url]) {
            return durationCache[url];
        }

        var promise = fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) {
                var bytes = new Uint8Array(buf);
                var packed = bytes[10];
                var pos = 13;

                if (packed & 0x80) {
                    pos += (2 << (packed & 0x07)) * 3;
                }

                var totalDelayCs = 0;

                while (pos < bytes.length) {
                    var block = bytes[pos];

                    if (block === 0x21) {
                        var label = bytes[pos + 1];
                        if (label === 0xF9) {
                            totalDelayCs += (bytes[pos + 4] | (bytes[pos + 5] << 8)) || 10;
                        }
                        pos = skipSubBlocks(bytes, pos + 2);
                    } else if (block === 0x2C) {
                        var lPacked = bytes[pos + 9];
                        pos += 10;
                        if (lPacked & 0x80) {
                            pos += (2 << (lPacked & 0x07)) * 3;
                        }
                        pos = skipSubBlocks(bytes, pos + 1);
                    } else {
                        break;
                    }
                }

                return Math.max(totalDelayCs * 10, 300);
            })
            .catch(function () {
                return 3000;
            });

        durationCache[url] = promise;
        return promise;
    }

    document.addEventListener('DOMContentLoaded', function () {
        var gifs = document.querySelectorAll('.project-media__image[src$=".gif"]:not([data-loop-forever])');

        gifs.forEach(function (img) {
            var container = img.parentElement;
            var originalSrc = img.src;

            var canvas = document.createElement('canvas');
            canvas.className = img.className;
            container.insertBefore(canvas, img.nextSibling);

            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'project-video__toggle';
            button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">play_arrow</span>';
            button.setAttribute('aria-label', 'Play animation');
            container.appendChild(button);

            var icon = button.querySelector('.material-symbols-outlined');
            var playing = false;
            var stopTimer = null;

            function freeze() {
                clearTimeout(stopTimer);
                stopTimer = null;

                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.style.display = 'block';
                img.style.display = 'none';
                icon.textContent = 'play_arrow';
                button.setAttribute('aria-label', 'Play animation');
                button.classList.add('is-video-paused');
                playing = false;
            }

            function play() {
                canvas.style.display = 'none';
                img.style.display = '';
                // restart the gif from frame 1 — clearing src first forces a real reload
                // instead of a no-op, and the browser serves it back out of cache
                img.src = '';
                img.src = originalSrc;
                icon.textContent = 'pause';
                button.setAttribute('aria-label', 'Pause animation');
                button.classList.remove('is-video-paused');
                playing = true;

                // data-loop: keep playing until the visitor pauses it, instead of freezing after one loop
                if (img.hasAttribute('data-loop')) {
                    return;
                }

                getGifLoopDuration(originalSrc).then(function (duration) {
                    if (!playing) {
                        return;
                    }
                    stopTimer = setTimeout(freeze, duration);
                });
            }

            function freezeOnFirstFrame() {
                var posterSeconds = parseFloat(img.getAttribute('data-poster-time'));
                var posterDelayMs = posterSeconds > 0 ? posterSeconds * 1000 : 0;

                function doFreeze() {
                    // let the gif actually play up to the requested point before
                    // capturing it, instead of always grabbing frame 1
                    if (posterDelayMs > 0) {
                        setTimeout(freeze, posterDelayMs);
                    } else {
                        freeze();
                    }
                }

                if (img.naturalWidth) {
                    doFreeze();
                } else {
                    img.addEventListener('load', doFreeze, { once: true });
                }
            }

            freezeOnFirstFrame();

            button.addEventListener('click', function () {
                if (playing) {
                    freeze();
                } else {
                    play();
                }
            });

            // gifs with an explicit poster time stay on their static frame until
            // clicked — they don't auto-play just because they scrolled into view
            if (!img.hasAttribute('data-poster-time')) {
                // watch the surrounding block, not the image: once frozen the image is display:none, and a
                // hidden element never reports as visible, so a GIF below the fold would never start
                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            observer.unobserve(container);
                            play();
                        }
                    });
                }, { threshold: 0.3 });

                observer.observe(container);
            }
        });
    });
})();
