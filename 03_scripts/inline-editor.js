(function () {
    // "Edit" dev-toggle — click it on, then click any eligible text to edit it in place;
    // Enter saves (straight back into the real HTML file on disk, via dev-tools/edit-server.js
    // — run that instead of a plain static server), Escape cancels. Only works over the
    // edit-server, since a plain static file server has nowhere to send the save request.
    //
    // "Eligible" is kept narrow on purpose: a leaf element (no child elements, so no nested
    // markup to disturb) that isn't part of an aria-hidden duplicate (nav/button hover-flip
    // text, the wave-text letters, the typewriter's hidden caret/typed spans) and isn't one of
    // this site's own dev-tool overlays. Headlines built from several spans (the typewriter
    // headline, the wave-text "Projects"/"Playground") aren't editable here yet — ask directly
    // for those few.
    var API = '/__edit';
    var EXCLUDE_SELECTOR = [
        '#dev-toggles', '#grid-overlay', '#tokens-panel',
        '.reveal-filenames-overlay', '.notes-toolbar', '.reminders-panel', '.sticky-note',
        '.measure-label', '.measure-distance-label',
        '[data-typewriter]', '.wave-text',
        '.view-cursor', '.caption-cursor', '.topic-hover-cursor', '.cursor-dot',
        '#home-clock', 'script', 'style', 'svg'
    ].join(',');

    function isLeaf(el) {
        return el.nodeType === 1 && el.children.length === 0 && el.textContent.trim().length > 0;
    }

    function isEditable(el) {
        return !!el && isLeaf(el) && !el.closest('[aria-hidden="true"]') && !el.closest(EXCLUDE_SELECTOR);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var toggles = document.getElementById('dev-toggles');

        if (!toggles) {
            return;
        }

        var btn = document.createElement('button');
        btn.id = 'edit-toggle';
        btn.className = 'dev-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = 'Edit';
        toggles.appendChild(btn);

        var filePath = location.pathname.replace(/^\/+/, '');
        var active = false;
        var current = null;
        var hovered = null;

        function ensureOriginal(el) {
            if (el.dataset.editOriginal === undefined) {
                el.dataset.editOriginal = el.textContent.trim();
            }

            return el.dataset.editOriginal;
        }

        // Which copy of this exact original text (there may be several "Intro"s on a page)
        // this element is, counting only other eligible elements earlier in the DOM — the
        // server uses the same index to pick the right spot in the file.
        function occurrenceFor(target, text) {
            var all = document.querySelectorAll('body *');
            var count = 0;

            for (var i = 0; i < all.length; i++) {
                var el = all[i];

                if (el === target) {
                    return count;
                }

                if (isEditable(el) && ensureOriginal(el) === text) {
                    count++;
                }
            }

            return count;
        }

        function stop(save) {
            var el = current;

            if (!el) {
                return;
            }

            current = null;
            el.removeAttribute('contenteditable');
            el.classList.remove('is-editing-now');

            var original = ensureOriginal(el);
            var next = el.textContent.trim();

            if (!save || !next || next === original) {
                el.textContent = original;
                return;
            }

            var occurrence = occurrenceFor(el, original);

            el.classList.add('is-saving');

            fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: filePath, oldText: original, newText: next, occurrence: occurrence })
            }).then(function (res) {
                el.classList.remove('is-saving');

                if (!res.ok) {
                    throw new Error('save failed');
                }

                el.dataset.editOriginal = next;
                el.classList.add('is-saved');
                setTimeout(function () { el.classList.remove('is-saved'); }, 900);
            }).catch(function () {
                el.textContent = original;
                el.classList.add('is-save-error');
                setTimeout(function () { el.classList.remove('is-save-error'); }, 1200);
            });
        }

        function start(el) {
            if (el === current) {
                return;
            }

            if (current) {
                stop(true);
            }

            ensureOriginal(el);
            current = el;
            el.setAttribute('contenteditable', 'plaintext-only');
            el.classList.add('is-editing-now');
            el.focus();

            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        btn.addEventListener('click', function () {
            active = !active;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', String(active));
            document.body.classList.toggle('is-edit-mode', active);

            if (!active) {
                stop(true);

                if (hovered) {
                    hovered.classList.remove('is-edit-hover');
                    hovered = null;
                }
            }
        });

        document.addEventListener('mouseover', function (e) {
            if (!active) {
                return;
            }

            var el = isEditable(e.target) ? e.target : null;

            if (hovered && hovered !== el) {
                hovered.classList.remove('is-edit-hover');
            }

            if (el && el !== current) {
                el.classList.add('is-edit-hover');
            }

            hovered = el;
        });

        document.addEventListener('click', function (e) {
            if (!active) {
                return;
            }

            var el = isEditable(e.target) ? e.target : null;

            if (!el) {
                if (current && !current.contains(e.target)) {
                    stop(true);
                }

                return;
            }

            if (el !== current) {
                e.preventDefault();
                start(el);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (!current) {
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                stop(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                stop(false);
            }
        });
    });
})();
