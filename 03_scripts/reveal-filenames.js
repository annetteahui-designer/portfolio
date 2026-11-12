(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('reveal-toggle');

        if (!toggle) {
            return;
        }

        var overlay = document.createElement('div');
        overlay.className = 'reveal-filenames-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            var button = e.target.closest('.reveal-filenames-copy');

            if (!button) {
                return;
            }

            var name = button.dataset.filename;

            navigator.clipboard.writeText(name).then(function () {
                button.classList.add('is-copied');
                setTimeout(function () {
                    button.classList.remove('is-copied');
                }, 1200);
            });
        });

        var active = false;

        function filenameFor(el) {
            var source = el;

            // GIFs get frozen to a <canvas> snapshot by project-gif-toggle.js, with the
            // original <img> hidden right behind it — read the filename from that img.
            if (el.tagName === 'CANVAS' && el.previousElementSibling && el.previousElementSibling.tagName === 'IMG') {
                source = el.previousElementSibling;
            }

            var url = source.currentSrc || source.src || source.getAttribute('src') || '';

            if (!url) {
                return null;
            }

            try {
                url = decodeURIComponent(url);
            } catch (e) {
                // leave url encoded if it can't be decoded
            }

            var parts = url.split('?')[0].split('/');
            return parts[parts.length - 1] || null;
        }

        function render() {
            overlay.innerHTML = '';

            if (!active) {
                return;
            }

            var media = document.querySelectorAll('main img, main video, main lottie-player, main canvas');

            media.forEach(function (el) {
                var name = filenameFor(el);

                if (!name) {
                    return;
                }

                var rect = el.getBoundingClientRect();

                if (rect.width < 4 || rect.height < 4) {
                    return;
                }

                var label = document.createElement('span');
                label.className = 'reveal-filenames-label';
                label.style.top = (rect.top + window.scrollY) + 'px';
                label.style.left = (rect.left + window.scrollX) + 'px';
                label.style.maxWidth = rect.width + 'px';

                var text = document.createElement('span');
                text.className = 'reveal-filenames-text';
                text.textContent = name;
                label.appendChild(text);

                var copyButton = document.createElement('button');
                copyButton.type = 'button';
                copyButton.className = 'reveal-filenames-copy';
                copyButton.dataset.filename = name;
                copyButton.setAttribute('aria-label', 'Copy filename');
                copyButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span><span class="material-symbols-outlined" aria-hidden="true">check</span>';
                label.appendChild(copyButton);

                overlay.appendChild(label);
            });
        }

        toggle.addEventListener('click', function () {
            active = !active;
            document.body.classList.toggle('show-file-names', active);
            toggle.classList.toggle('is-active', active);
            toggle.setAttribute('aria-pressed', String(active));
            render();
        });

        window.addEventListener('resize', function () {
            if (active) {
                render();
            }
        });

        window.addEventListener('scroll', function () {
            if (active) {
                render();
            }
        }, { passive: true });
    });
})();
