(function () {
    var carType = new URLSearchParams(window.location.search).get('car_type');
    if (!carType) return;

    // Runs on window "load" (registered after main.js's own load handler,
    // since this script tag comes after main.js), so the isotope instance
    // and its filter-button click binding already exist by the time this
    // fires. Reusing a real click keeps the grid, the "is-checked" state,
    // and the dropdown label all in sync via the existing handlers.
    window.addEventListener('load', function () {
        var btn = document.querySelector('.filters-button-group button[data-filter=".' + carType + '"]');
        if (btn) btn.click();
    });
})();
