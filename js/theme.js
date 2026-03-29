(function () {
    var root = document.documentElement;
    var key = 'site-theme';
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    function readSavedTheme() {
        try {
            var value = localStorage.getItem(key);
            return value === 'light' || value === 'dark' ? value : null;
        } catch (e) {
            return null;
        }
    }

    function applySavedTheme() {
        var saved = readSavedTheme();
        if (saved) {
            root.setAttribute('data-theme', saved);
        }
    }

    function getCurrentTheme() {
        var manual = root.getAttribute('data-theme');
        if (manual === 'light' || manual === 'dark') {
            return manual;
        }
        return media.matches ? 'dark' : 'light';
    }

    function syncThemeLogos(theme) {
        var mode = theme === 'light' ? 'light' : 'dark';
        var logos = document.querySelectorAll('img[data-dark-logo][data-light-logo]');

        logos.forEach(function (logo) {
            var darkLogo = logo.getAttribute('data-dark-logo');
            var lightLogo = logo.getAttribute('data-light-logo');
            var targetLogo = mode === 'light' ? lightLogo : darkLogo;

            if (targetLogo && logo.getAttribute('src') !== targetLogo) {
                logo.setAttribute('src', targetLogo);
            }
        });
    }

    function syncToggleLabel() {
        var btn = document.getElementById('themeToggle');
        if (!btn) {
            return;
        }

        var current = getCurrentTheme();
        var next = current === 'dark' ? 'light' : 'dark';
        btn.textContent = 'Switch to ' + next + ' mode';
        btn.setAttribute('aria-pressed', String(current === 'dark'));
    }

    function onToggleClick() {
        var current = getCurrentTheme();
        var next = current === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', next);
        try {
            localStorage.setItem(key, next);
        } catch (e) {
            // Ignore storage failures in private browsing or blocked storage.
        }

        syncThemeLogos(next);
        syncToggleLabel();
    }

    function initToggle() {
        var btn = document.getElementById('themeToggle');
        if (!btn || btn.dataset.themeBound === 'true') {
            return;
        }

        btn.addEventListener('click', onToggleClick);
        btn.dataset.themeBound = 'true';
    }

    function onSystemThemeChanged() {
        if (!readSavedTheme()) {
            var current = getCurrentTheme();
            syncThemeLogos(current);
            syncToggleLabel();
        }
    }

    function init() {
        initToggle();
        var current = getCurrentTheme();
        syncThemeLogos(current);
        syncToggleLabel();

        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', onSystemThemeChanged);
        } else if (typeof media.addListener === 'function') {
            media.addListener(onSystemThemeChanged);
        }
    }

    // Apply saved theme as early as possible on every page.
    applySavedTheme();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
