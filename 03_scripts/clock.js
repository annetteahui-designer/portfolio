(function () {
    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function tick(el) {
        var now = new Date();
        var hours = now.getHours();
        var period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }

        el.textContent = pad(hours) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + ' ' + period + ' in the big apple';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var el = document.getElementById('clock');

        if (!el) {
            return;
        }

        tick(el);
        setInterval(function () {
            tick(el);
        }, 1000);
    });
})();
