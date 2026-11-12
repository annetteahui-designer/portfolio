(function () {
    var GRID_COLUMNS = 16;

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('grid-toggle');
        var overlay = document.getElementById('grid-overlay');
        var inner = overlay.querySelector('.grid-overlay__inner');

        for (var i = 0; i < GRID_COLUMNS; i++) {
            var col = document.createElement('div');
            col.className = 'grid-overlay__col';
            inner.appendChild(col);
        }

        toggle.addEventListener('click', function () {
            var isActive = overlay.classList.toggle('is-active');
            toggle.classList.toggle('is-active', isActive);
            toggle.setAttribute('aria-pressed', String(isActive));
        });
    });
})();
