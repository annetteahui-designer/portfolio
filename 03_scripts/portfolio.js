(function () {
    var IMAGE_PATH = '../00_assets/01_images/';
    var USE_PLACEHOLDERS = true;

    var WORK_ITEMS = [
        { title: 'IBM Research', media: 'Brand Design · Graphic Design · Web Design · Illustration · Motion Design', video: IMAGE_PATH + 'Homepage/lunar_1x1_blackAndWhite.mp4', ratio: '1-1', wide: true, link: 'project-ibm-research.html' },
        { title: 'The DocuSign Developer Library', media: 'Branding · Illustration', image: IMAGE_PATH + 'DocuSign/webPortfolio_docusign_frame_7.png', ratio: '1-1', forceImage: true, link: 'project-docusign.html' },
        { title: 'The Printed Forest', media: 'Personal Store', image: IMAGE_PATH + 'Printed Forest/webPortfolio_printedForest_bear.jpg', ratio: '1-1', forceImage: true, link: 'project-template.html' },
        { title: 'MetaMask', media: 'Graphic Design · Motion Design', video: IMAGE_PATH + 'Homepage/webPortfolio_MwM3.mp4', ratio: '9-16', link: 'project-metamask.html' },
        { title: 'Consensys', media: 'Graphic Design · Motion Design · Web Design', image: IMAGE_PATH + 'Homepage/webPortfolio_consensys.png', ratio: '1-1', forceImage: true, link: 'project-consensys.html' },
        { title: 'Sovereignty — The Video Game', media: 'Branding · Illustration', image: IMAGE_PATH + 'Homepage/webPortfolio_soverienty_cover.png', ratio: '16-9', wide: true, forceImage: true, link: 'project-sovienty.html' },
        { title: 'C Stands for Corporation! Albertsons, Aetna, Toyota', media: 'Branding · Illustration', image: IMAGE_PATH + 'Homepage/webPortfolio_corporation.png', ratio: '1-1', forceImage: true, link: 'project-corporation.html' },
        { title: 'Ugly Dried Fruit', media: 'Packaging Design · Illustration', image: IMAGE_PATH + 'Homepage/webPortfolio_ugly_cover.png', ratio: '16-9', wide: true, forceImage: true, link: 'project-ugly-dried-fruit.html' },
        { title: 'Layland RV Park & Campsite', media: 'Branding', image: IMAGE_PATH + 'Layland/webPortfolio_layland_cardCover.png', ratio: '1-1', forceImage: true, link: 'project-layland.html' }
    ];

    function renderTile(item, index) {
        var tile = document.createElement('article');
        tile.className = 'mosaic__tile' + (item.wide ? ' mosaic__tile--wide' : '');
        tile.setAttribute('data-reveal', '');

        var content = item.link ? document.createElement('a') : tile;

        if (item.link) {
            content.className = 'mosaic__tile-link';
            content.href = item.link;
            tile.appendChild(content);
        }

        var mediaWrap = document.createElement('div');
        mediaWrap.className = 'mosaic__media';
        content.appendChild(mediaWrap);

        if (item.video) {
            var video = document.createElement('video');
            video.className = 'mosaic__image ratio-' + item.ratio;
            video.src = item.video;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            mediaWrap.appendChild(video);
        } else if (item.image && (item.forceImage || !USE_PLACEHOLDERS)) {
            var img = document.createElement('img');
            img.className = 'mosaic__image ratio-' + item.ratio;
            img.src = item.image;
            img.alt = item.title;
            img.loading = 'lazy';
            mediaWrap.appendChild(img);
        } else {
            var placeholder = document.createElement('div');
            placeholder.className = 'mosaic__placeholder ratio-' + item.ratio;
            mediaWrap.appendChild(placeholder);
        }

        var number = String(index + 1).padStart(2, '0');

        var title = document.createElement('p');
        title.className = 'mosaic__caption-title';
        title.textContent = number + ' / ' + item.title;
        title.setAttribute('data-decode', '');
        content.appendChild(title);

        var media = document.createElement('p');
        media.className = 'mosaic__caption-media';
        media.textContent = item.media;
        media.setAttribute('data-decode', '');
        content.appendChild(media);

        return tile;
    }

    function renderGrid(el, items) {
        if (!el) {
            return;
        }

        items.forEach(function (item, index) {
            el.appendChild(renderTile(item, index));
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderGrid(document.getElementById('work-grid'), WORK_ITEMS);
    });
})();
