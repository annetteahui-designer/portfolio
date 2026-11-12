(function () {
    // A green pill that follows the pointer over any [data-hover-caption="..."] photo and
    // types its caption out word by word, growing to fit as each word lands — independent of
    // view-cursor.js's plain "View" circle, for photos that want their own specific caption
    // instead (e.g. data-hover-caption="Made in C4D"). A target can also carry
    // data-hover-image="path/to.jpg" to drop a small preview thumbnail below the pill (e.g.
    // the Pencil.mp4 hero showing the pencilStill.jpg still it used to open on).
    //
    // A target additionally marked data-hover-caption-then-pause (the homepage hero) hands
    // off to view-cursor.js's own "Pause"/"Play" circle once the caption's had a moment to
    // read: after it finishes typing and a short hold, this pill hides and marks the element
    // .caption-cursor-done, which view-cursor.js's project-video/media target treats the same
    // as not having a caption at all. The mark clears on mouseleave (or on hovering a
    // different caption target), so the next hover starts the caption over from the beginning
    // instead of jumping straight to the pause circle.
    var WORD_DELAY_MS = 170;
    var HOLD_AFTER_TYPE_MS = 1500;

    document.addEventListener('DOMContentLoaded', function () {
        if (!document.querySelector('[data-hover-caption]')) {
            return;
        }

        // Mouse-only: no hover on a touch screen, so this pill (and the caption-then-pause
        // handoff it drives) never shows on tablet/mobile.
        if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        var cursor = document.createElement('div');
        cursor.className = 'caption-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = '<div class="caption-cursor__pill"><span class="caption-cursor__text"></span></div><img class="caption-cursor__image" alt="" hidden>';
        document.body.appendChild(cursor);

        var pill = cursor.querySelector('.caption-cursor__pill');
        var textEl = cursor.querySelector('.caption-cursor__text');
        var imageEl = cursor.querySelector('.caption-cursor__image');
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var current = null;
        var typeTimer = null;
        var handoffTimer = null;

        // Classic width-transition trick: read the width the pill would need for the new text,
        // snap back to the width it had a moment ago, then let the CSS transition animate the
        // one explicit step from old width to new — auto-width boxes can't transition directly.
        function growTo(text) {
            var startWidth = pill.getBoundingClientRect().width;
            textEl.textContent = text;
            pill.style.width = 'auto';
            var targetWidth = pill.getBoundingClientRect().width;
            pill.style.width = startWidth + 'px';
            pill.getBoundingClientRect();
            requestAnimationFrame(function () {
                pill.style.width = targetWidth + 'px';
            });
        }

        function typeWords(words, index) {
            growTo(words.slice(0, index + 1).join(' '));

            if (index + 1 < words.length) {
                typeTimer = setTimeout(function () { typeWords(words, index + 1); }, WORD_DELAY_MS);
            }
        }

        function hideCursor() {
            clearTimeout(typeTimer);
            cursor.classList.remove('is-active');
            document.body.classList.remove('hide-cursor-dot');
            imageEl.hidden = true;
            imageEl.removeAttribute('src');
        }

        function activate(el) {
            if (current && current !== el) {
                current.classList.remove('caption-cursor-done');
            }

            current = el;
            cursor.classList.add('is-active');
            document.body.classList.add('hide-cursor-dot');

            var imageSrc = el.getAttribute('data-hover-image');

            if (imageSrc) {
                imageEl.src = imageSrc;
                imageEl.hidden = false;
            } else {
                imageEl.hidden = true;
                imageEl.removeAttribute('src');
            }

            var caption = el.getAttribute('data-hover-caption') || '';
            var words = caption.split(/\s+/).filter(Boolean);

            clearTimeout(typeTimer);
            clearTimeout(handoffTimer);
            pill.style.width = '0px';
            textEl.textContent = '';

            if (reduceMotion || words.length < 2) {
                growTo(caption);
            } else {
                typeWords(words, 0);
            }

            if (el.hasAttribute('data-hover-caption-then-pause')) {
                var readTime = words.length * WORD_DELAY_MS + HOLD_AFTER_TYPE_MS;
                handoffTimer = setTimeout(function () { handoff(el); }, readTime);
            }
        }

        // Cedes this hover to view-cursor.js's own Pause/Play circle instead of staying
        // caption-cursor's — `current` stays pointed at el (so deactivate can still clear the
        // mark later) but the mousemove handler below skips re-activating a marked element,
        // leaving view-cursor.js's own hit-test free to pick it up.
        function handoff(el) {
            el.classList.add('caption-cursor-done');
            hideCursor();
        }

        function deactivate() {
            if (current) {
                current.classList.remove('caption-cursor-done');
            }
            clearTimeout(handoffTimer);
            current = null;
            hideCursor();
        }

        document.addEventListener('mousemove', function (e) {
            cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';

            var el = e.target.closest ? e.target.closest('[data-hover-caption]') : null;

            if (!el) {
                if (current) {
                    deactivate();
                }
                return;
            }

            if (el.classList.contains('caption-cursor-done')) {
                return;
            }

            if (current !== el) {
                activate(el);
            }
        });

        document.addEventListener('mouseleave', deactivate);
    });
})();
