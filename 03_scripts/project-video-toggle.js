(function () {
    // Pause/play for looping videos. Any <video> that qualifies gets the same
    // .project-video wrapper + .project-video__toggle button the hand-built ones use, so a
    // new video picks up the control (and the "Pause"/"Play" cursor circle from
    // view-cursor.js) without any extra markup.
    //
    // Left alone on purpose: videos inside a link (a click there must navigate), the one-shot
    // hero intro, videos with native controls, and any video that already has a toggle.
    function qualifies(video) {
        if (video.closest('a') || video.hasAttribute('controls') || video.classList.contains('hero-banner__image')) {
            return false;
        }

        var parent = video.parentElement;

        return !(parent && parent.querySelector(':scope > .project-video__toggle'));
    }

    function addToggle(video) {
        var wrapper = document.createElement('div');
        wrapper.className = 'project-video';
        video.parentNode.insertBefore(wrapper, video);
        wrapper.appendChild(video);

        // A video whose media already carries its own hover pill (data-hover-caption, see
        // caption-cursor.js) keeps the Pause/Play circle off the whole area while that pill is
        // showing — the two cursors at once over the same hover looked broken — restricting it
        // to just the button itself, same as data-toggle-only already does for the About face.
        // Skipped for data-hover-caption-then-pause media: once the caption hands off (see
        // view-cursor.js's wide-area target), the wide-area circle is exactly what should take
        // over, so this never restricts those permanently the way it does a plain caption that
        // has nowhere to hand off to.
        if (video.closest('[data-hover-caption]') && !video.closest('[data-hover-caption-then-pause]')) {
            wrapper.setAttribute('data-toggle-only', '');
        }

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-video__toggle';
        button.setAttribute('aria-label', 'Pause video');
        button.setAttribute('data-video-toggle', '');
        button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">pause</span>';
        wrapper.appendChild(button);
    }

    // Videos marked data-lazy-play start only while they are on screen and pause when they leave
    // (a page that carries several layouts has most of its videos hidden at any moment, and those
    // shouldn't download or play). A video the visitor paused themselves is not restarted.
    function watchLazyVideos() {
        var lazy = document.querySelectorAll('video[data-lazy-play]');

        if (!lazy.length) {
            return;
        }

        if (!('IntersectionObserver' in window)) {
            lazy.forEach(function (v) { v.play(); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var video = entry.target;

                if (entry.isIntersecting) {
                    if (!video.hasAttribute('data-user-paused')) {
                        var started = video.play();

                        if (started && started.catch) {
                            started.catch(function () {});
                        }
                    }
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.1 });

        lazy.forEach(function (video) {
            observer.observe(video);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('video')).filter(qualifies).forEach(addToggle);

        document.querySelectorAll('[data-video-toggle]').forEach(function (button) {
            var wrapper = button.closest('.project-video');
            var video = wrapper ? wrapper.querySelector('video') : null;
            var icon = button.querySelector('.material-symbols-outlined');

            if (!video || !icon) {
                return;
            }

            // icon + label + circle all follow the video's real state, so they stay right
            // even if it is paused or started some other way (autoplay blocked, tab hidden,
            // etc.) — .is-video-paused is what shows the white circle behind the play icon.
            function sync() {
                var paused = video.paused;
                icon.textContent = paused ? 'play_arrow' : 'pause';
                button.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
                button.classList.toggle('is-video-paused', paused);
            }

            video.addEventListener('play', sync);
            video.addEventListener('pause', sync);

            button.addEventListener('click', function () {
                if (video.paused) {
                    video.removeAttribute('data-user-paused');
                    video.play();
                } else {
                    video.setAttribute('data-user-paused', '');
                    video.pause();
                }

                // `paused` flips immediately but the play/pause events arrive a beat later —
                // sync now so the label (and the cursor circle reading it) is right straight away
                sync();
            });

            sync();
        });

        watchLazyVideos();
    });
})();
