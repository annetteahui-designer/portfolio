(function () {
    function tick(el) {
        var parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).formatToParts(new Date());
        var map = {};
        parts.forEach(function (p) { map[p.type] = p.value; });
        el.textContent = map.hour + ':' + map.minute + ':' + map.second + ' ' + map.dayPeriod + ' EST';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var el = document.getElementById('home-clock');
        if (!el) {
            return;
        }
        tick(el);
        setInterval(function () {
            tick(el);
        }, 1000);
    });
})();
