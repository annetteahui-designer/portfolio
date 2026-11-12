(function () {
    var TYPE_TOKENS = ['--type-12', '--type-16', '--type-20', '--type-24', '--type-32', '--type-40', '--type-48', '--type-64', '--type-80', '--type-96', '--type-128'];
    var SPACING_TOKENS = ['--spacing-01', '--spacing-02', '--spacing-03', '--spacing-04', '--spacing-05', '--spacing-06', '--spacing-07', '--spacing-08', '--spacing-09', '--spacing-10', '--spacing-11', '--spacing-12', '--spacing-13'];
    var COLOR_TOKENS = ['--color-green', '--color-blue', '--color-pink', '--color-yellow', '--color-orange', '--color-ink', '--color-line'];

    // Canonical discipline → icon → color mapping, reused by the skills list (homepage)
    // and every project page's "Design Areas" tags. Keep this in sync if either changes.
    var DISCIPLINE_TOKENS = [
        { name: 'Branding', icon: 'custom_typography', color: 'blue' },
        { name: 'Graphic Design', icon: 'imagesmode', color: 'green' },
        { name: 'Illustration', icon: 'edit', color: 'pink' },
        { name: 'Motion Design', icon: 'animation', color: 'yellow' },
        { name: 'UI / Web Design', icon: 'language', color: 'orange' }
    ];

    function tokenValue(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function addSection(panel, title) {
        var section = document.createElement('div');
        section.className = 'tokens-panel__section';

        var heading = document.createElement('h4');
        heading.className = 'tokens-panel__heading';
        heading.textContent = title;
        section.appendChild(heading);

        panel.appendChild(section);
        return section;
    }

    function renderType(section) {
        TYPE_TOKENS.forEach(function (name) {
            var value = tokenValue(name);

            var row = document.createElement('div');
            row.className = 'tokens-panel__row';

            var sample = document.createElement('span');
            sample.className = 'tokens-panel__sample';
            sample.style.fontSize = value;
            sample.textContent = 'Aa';

            var label = document.createElement('span');
            label.className = 'tokens-panel__label';
            label.textContent = name.replace('--type-', '') + 'px';

            row.appendChild(sample);
            row.appendChild(label);
            section.appendChild(row);
        });
    }

    function renderSpacing(section) {
        SPACING_TOKENS.forEach(function (name) {
            var value = tokenValue(name);

            var row = document.createElement('div');
            row.className = 'tokens-panel__row tokens-panel__row--spacing';

            var bar = document.createElement('span');
            bar.className = 'tokens-panel__spacing-bar';
            bar.style.width = value;

            var label = document.createElement('span');
            label.className = 'tokens-panel__label';
            label.textContent = name.replace('--spacing-', '') + ' · ' + value;

            row.appendChild(bar);
            row.appendChild(label);
            section.appendChild(row);
        });
    }

    function renderColor(section) {
        COLOR_TOKENS.forEach(function (name) {
            var value = tokenValue(name);

            var row = document.createElement('div');
            row.className = 'tokens-panel__row tokens-panel__row--color';

            var swatch = document.createElement('span');
            swatch.className = 'tokens-panel__color-swatch';
            swatch.style.backgroundColor = value;

            var meta = document.createElement('span');
            meta.className = 'tokens-panel__color-meta';

            var colorName = document.createElement('span');
            colorName.className = 'tokens-panel__color-name';
            colorName.textContent = name.replace('--color-', '');

            var colorValue = document.createElement('span');
            colorValue.className = 'tokens-panel__color-value';
            colorValue.textContent = value;

            meta.appendChild(colorName);
            meta.appendChild(colorValue);

            row.appendChild(swatch);
            row.appendChild(meta);
            section.appendChild(row);
        });
    }

    function renderIcons(section) {
        DISCIPLINE_TOKENS.forEach(function (token) {
            var row = document.createElement('div');
            row.className = 'tokens-panel__row tokens-panel__row--color';

            var swatch = document.createElement('span');
            swatch.className = 'tokens-panel__color-swatch material-symbols-outlined';
            swatch.style.backgroundColor = tokenValue('--color-' + token.color);
            swatch.style.display = 'flex';
            swatch.style.alignItems = 'center';
            swatch.style.justifyContent = 'center';
            swatch.style.color = '#000';
            swatch.style.fontSize = '16px';
            swatch.textContent = token.icon;

            var meta = document.createElement('span');
            meta.className = 'tokens-panel__color-meta';

            var iconName = document.createElement('span');
            iconName.className = 'tokens-panel__color-name';
            iconName.textContent = token.name;

            var iconValue = document.createElement('span');
            iconValue.className = 'tokens-panel__color-value';
            iconValue.textContent = token.icon + ' · ' + token.color;

            meta.appendChild(iconName);
            meta.appendChild(iconValue);

            row.appendChild(swatch);
            row.appendChild(meta);
            section.appendChild(row);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('tokens-toggle');
        var panel = document.getElementById('tokens-panel');

        if (!toggle || !panel) {
            return;
        }

        renderType(addSection(panel, 'Type'));
        renderSpacing(addSection(panel, 'Spacing'));
        renderColor(addSection(panel, 'Color'));
        renderIcons(addSection(panel, 'Icons'));

        toggle.addEventListener('click', function () {
            var isActive = panel.classList.toggle('is-active');
            toggle.classList.toggle('is-active', isActive);
            toggle.setAttribute('aria-pressed', String(isActive));
        });
    });
})();
