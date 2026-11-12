(function () {
    // Lottie playback for any [data-lottie-src] block, using the lottie-web "light" build
    // vendored in 03_scripts/vendor (v5.13.0) so the page has no CDN dependency.
    //
    //   data-lottie-src      the idle animation — loops, and is what shows by default
    //   data-lottie-actions  optional JSON list of one-shot animations, each { label, src }.
    //                        Clicking the block plays the next one; when it finishes the block
    //                        returns to idle, and the next click plays the following action
    //                        (Feed → Spin → Feed …). While the block is idle it carries
    //                        data-cursor-label = the next action's label, which view-cursor.js
    //                        shows in the cursor circle; the attribute is removed while an
    //                        action plays.
    //   data-lottie-trigger  "hover" plays the actions when the pointer enters (or the link is
    //                        focused) instead of on click, with no cursor label — the logo uses
    //                        this to spin once on hover. It stays put until the pointer leaves
    //                        and comes back, and reduced-motion visitors don't get the spin.
    //
    // Every animation is loaded up front and stacked as a layer, so switching is instant.
    // The <img> inside the block is a fallback shown until the idle animation is ready (and
    // kept if it can't load). A sibling .project-video__toggle button, if present, pauses and
    // resumes whichever animation is showing — the same component the videos use.
    document.addEventListener('DOMContentLoaded', function () {
        var blocks = document.querySelectorAll('[data-lottie-src]');

        if (!blocks.length || !window.lottie) {
            return;
        }

        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        blocks.forEach(function (block) {
            var wrapper = block.closest('.project-video');
            var button = wrapper ? wrapper.querySelector(':scope > .project-video__toggle') : null;
            var icon = button ? button.querySelector('.material-symbols-outlined') : null;
            var actionDefs = [];

            try {
                actionDefs = JSON.parse(block.getAttribute('data-lottie-actions') || '[]');
            } catch (e) {
                actionDefs = [];
            }

            var triggerOnHover = block.getAttribute('data-lottie-trigger') === 'hover';
            var pausedByUser = reduceMotion;
            var busy = false;          // an action is playing
            var nextIndex = 0;
            var idle = null;
            var actions = [];
            var active = null;

            function makeLayer(src, loop) {
                var el = document.createElement('div');
                el.className = 'about__media-lottie-layer';
                block.appendChild(el);

                var layer = { el: el, ready: false, failed: false };

                layer.animation = window.lottie.loadAnimation({
                    container: el,
                    renderer: 'svg',
                    loop: loop,
                    autoplay: false,
                    path: src,
                    // fill the square like object-fit: cover instead of letterboxing
                    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
                });

                layer.animation.addEventListener('DOMLoaded', function () {
                    layer.ready = true;
                    updateLabel();
                });

                layer.animation.addEventListener('data_failed', function () {
                    layer.failed = true;
                    updateLabel();
                });

                return layer;
            }

            function show(layer) {
                active = layer;
                [idle].concat(actions).forEach(function (l) {
                    l.el.classList.toggle('is-active', l === layer);
                });
            }

            // icon + label follow whatever is showing
            function sync() {
                if (!button || !icon || !active) {
                    return;
                }

                icon.textContent = active.animation.isPaused ? 'play_arrow' : 'pause';
                button.setAttribute('aria-label', active.animation.isPaused ? 'Play animation' : 'Pause animation');
            }

            // the next action that actually loaded (skips one that failed)
            function nextAction() {
                for (var i = 0; i < actions.length; i++) {
                    var candidate = actions[(nextIndex + i) % actions.length];

                    if (candidate.ready) {
                        nextIndex = (nextIndex + i) % actions.length;
                        return candidate;
                    }
                }

                return null;
            }

            function updateLabel() {
                // hover-triggered blocks have no cursor label
                if (!actions.length || !idle.ready || triggerOnHover) {
                    return;
                }

                var next = busy ? null : nextAction();

                if (next) {
                    block.setAttribute('data-cursor-label', next.label);
                    block.setAttribute('aria-label', next.label);
                    block.setAttribute('aria-disabled', 'false');
                } else {
                    block.removeAttribute('data-cursor-label');
                    block.setAttribute('aria-disabled', 'true');
                }
            }

            function returnToIdle() {
                busy = false;
                nextIndex = (nextIndex + 1) % actions.length;
                show(idle);

                if (reduceMotion || pausedByUser) {
                    idle.animation.goToAndStop(0, true);
                } else {
                    idle.animation.goToAndPlay(0, true);
                }

                updateLabel();
                sync();
            }

            function playAction() {
                var next = busy || !idle.ready ? null : nextAction();

                if (!next) {
                    return;
                }

                busy = true;
                idle.animation.pause();
                show(next);
                next.animation.goToAndPlay(0, true);
                updateLabel();
                sync();
            }

            idle = makeLayer(block.getAttribute('data-lottie-src'), true);
            actionDefs.forEach(function (def) {
                var layer = makeLayer(def.src, false);
                layer.label = def.label;
                layer.animation.addEventListener('complete', function () {
                    if (active === layer) {
                        returnToIdle();
                    }
                });
                actions.push(layer);
            });

            if (actions.length && triggerOnHover) {
                // the whole link is the hover target, not just the disc inside it
                var hoverTarget = block.closest('a') || block;

                if (!reduceMotion) {
                    hoverTarget.addEventListener('mouseenter', playAction);
                    hoverTarget.addEventListener('focus', playAction);
                }
            } else if (actions.length) {
                block.setAttribute('role', 'button');
                block.setAttribute('tabindex', '0');

                block.addEventListener('click', playAction);
                block.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        playAction();
                    }
                });
            }

            if (button) {
                // until the idle animation is ready there is nothing to pause
                button.hidden = true;

                button.addEventListener('click', function () {
                    if (active.animation.isPaused) {
                        if (!busy) {
                            pausedByUser = false;
                        }
                        active.animation.play();
                    } else {
                        if (!busy) {
                            pausedByUser = true;
                        }
                        active.animation.pause();
                    }

                    sync();
                });
            }

            idle.animation.addEventListener('DOMLoaded', function () {
                var fallback = block.querySelector('img');

                if (fallback) {
                    fallback.remove();
                }

                show(idle);

                // reduced motion: hold the resting face until the visitor presses play
                if (reduceMotion) {
                    idle.animation.goToAndStop(0, true);
                } else {
                    idle.animation.play();
                }

                // don't spend CPU animating while scrolled out of view — and never restart
                // something the visitor paused themselves
                if (!reduceMotion && 'IntersectionObserver' in window) {
                    new IntersectionObserver(function (entries) {
                        entries.forEach(function (entry) {
                            if (entry.isIntersecting && (!pausedByUser || busy)) {
                                active.animation.play();
                            } else if (!entry.isIntersecting) {
                                active.animation.pause();
                            }

                            sync();
                        });
                    }, { threshold: 0.1 }).observe(block);
                }

                if (button) {
                    button.hidden = false;
                }

                updateLabel();
                sync();
            });
        });
    });
})();
