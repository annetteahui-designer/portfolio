(function () {
    // Cursor label — a circle that follows the pointer over certain elements and names
    // what a click will do. One circle is shared by every target below.
    //
    // Listeners are delegated to the document (not bound per element) so targets that other
    // scripts create later — like the GIF play buttons — work without any extra wiring.
    //
    // Each target says how to find its element (`find`), what the circle reads (`label`,
    // a string or a function of the element so it can follow live state), and optionally
    // what a click on it should do (`activate`).
    function nearest(node, selector, accept) {
        var el = node.closest(selector);

        while (el && accept && !accept(el)) {
            el = el.parentElement ? el.parentElement.closest(selector) : null;
        }

        return el;
    }

    // A media block owns a play/pause button when the button is a direct child of it: the
    // <video> and YouTube blocks (.project-video) and the GIF blocks (.project-media).
    function toggleOf(el) {
        return el.querySelector(':scope > .project-video__toggle');
    }

    var TARGETS = [
        {
            find: function (node) { return nearest(node, '.mosaic__tile-link, .hero__slides'); },
            label: 'View'
        },
        {
            find: function (node) { return nearest(node, '.site-footer__sketch-item'); },
            label: 'Connect'
        },
        {
            // over the pause/play button itself: always "Pause" or "Play" — except a button
            // marked data-hide-cursor-label (the homepage hero), which keeps the button visible
            // and clickable but skips the call-to-action circle entirely.
            find: function (node) {
                return nearest(node, '.project-video__toggle', function (el) {
                    return !el.hasAttribute('data-hide-cursor-label');
                });
            },
            label: function (el) {
                return (el.getAttribute('aria-label') || 'Play').split(' ')[0];
            }
        },
        {
            // any element can name its own action: the About face reads "Feed" / "Spin", and
            // removes the attribute while its animation is playing so the circle steps aside
            find: function (node) { return nearest(node, '[data-cursor-label]'); },
            label: function (el) { return el.getAttribute('data-cursor-label') || ''; }
        },
        {
            // hovering anywhere over the media — not just the small button — shows the circle.
            // Media marked data-toggle-only keeps it to the button (the About face uses the body
            // for its own actions). Media marked data-hover-caption-then-pause (the homepage
            // hero, and any mosaic tile video with a caption) holds this circle back until
            // caption-cursor.js's own pill has had its turn first and marked the element
            // .caption-cursor-done — checked via closest() rather than on el directly, since a
            // mosaic tile's data-hover-caption-then-pause sits on the outer .mosaic__media, one
            // level above the .project-video that el actually matches here.
            find: function (node) {
                return nearest(node, '.project-video, .project-media', function (el) {
                    if (!toggleOf(el) || el.hasAttribute('data-toggle-only')) {
                        return false;
                    }

                    var captioned = el.closest('[data-hover-caption-then-pause]');
                    return !captioned || captioned.classList.contains('caption-cursor-done');
                });
            },
            // the toggle scripts already flip aria-label between "Pause …" and "Play …"
            label: function (el) {
                return (toggleOf(el).getAttribute('aria-label') || 'Play').split(' ')[0];
            },
            // clicking the media does what the circle says, exactly like clicking the button
            activate: function (el) { return toggleOf(el); }
        }
    ];

    document.addEventListener('DOMContentLoaded', function () {
        var cursor = document.createElement('div');
        cursor.className = 'view-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = '<div class="view-cursor__circle"><span class="view-cursor__label"></span></div>';
        document.body.appendChild(cursor);

        var labelEl = cursor.querySelector('.view-cursor__label');
        var current = null; // { target, el } while the pointer is over a target

        function labelFor(hit) {
            return typeof hit.target.label === 'function' ? hit.target.label(hit.el) : hit.target.label;
        }

        function hitAt(node) {
            if (!node || !node.closest) {
                return null;
            }

            for (var i = 0; i < TARGETS.length; i++) {
                var el = TARGETS[i].find(node);

                if (el) {
                    return { target: TARGETS[i], el: el };
                }
            }

            return null;
        }

        function deactivate() {
            current = null;
            cursor.classList.remove('is-active', 'is-pressed');
            document.body.classList.remove('hide-cursor-dot');
        }

        document.addEventListener('mousemove', function (e) {
            cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';

            var hit = hitAt(e.target);

            if (!hit) {
                if (current) {
                    deactivate();
                }
                return;
            }

            if (!current || current.el !== hit.el) {
                current = hit;
                cursor.classList.add('is-active');
                document.body.classList.add('hide-cursor-dot');
            }

            // re-read every move so the word stays right after a click flips Pause ↔ Play
            var text = labelFor(hit);

            if (labelEl.textContent !== text) {
                labelEl.textContent = text;
            }
        });

        document.addEventListener('mouseleave', deactivate);

        document.addEventListener('mousedown', function () {
            if (current) {
                cursor.classList.add('is-pressed');
            }
        });

        document.addEventListener('mouseup', function () {
            cursor.classList.remove('is-pressed');
        });

        document.addEventListener('click', function (e) {
            if (!current) {
                return;
            }

            // media that forwards clicks to its button, exactly like clicking the button itself
            if (current.target.activate) {
                var button = current.target.activate(current.el);

                // a click on the button itself already runs its own handler
                if (button && !button.contains(e.target)) {
                    button.click();
                }
            }

            // the click just changed state — refresh the word without waiting for a mouse move,
            // and step aside if the element no longer offers a label
            if (current) {
                if (!current.target.find(current.el)) {
                    deactivate();
                } else {
                    labelEl.textContent = labelFor(current);
                }
            }
        });
    });
})();
