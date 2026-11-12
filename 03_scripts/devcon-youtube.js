(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var container = document.getElementById('devcon-youtube-player');

        if (!container) {
            return;
        }

        var videoId = container.dataset.youtubeId;
        var button = document.querySelector('[data-youtube-toggle]');
        var icon = button ? button.querySelector('.material-symbols-outlined') : null;
        var player = null;

        function createPlayer() {
            player = new YT.Player('devcon-youtube-player', {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    loop: 1,
                    playlist: videoId,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1
                },
                events: {
                    onReady: function (event) {
                        event.target.playVideo();
                    }
                }
            });
        }

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = createPlayer;
        }

        if (button) {
            button.addEventListener('click', function () {
                if (!player || !player.getPlayerState) {
                    return;
                }

                if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                    player.pauseVideo();
                    icon.textContent = 'play_arrow';
                    button.setAttribute('aria-label', 'Play video');
                } else {
                    player.playVideo();
                    icon.textContent = 'pause';
                    button.setAttribute('aria-label', 'Pause video');
                }
            });
        }
    });
})();
