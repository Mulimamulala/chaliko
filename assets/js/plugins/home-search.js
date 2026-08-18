(function () {
    var wrap = document.querySelector('.booking-search-form.booking-two');
    var btn = document.getElementById('home-search-btn');
    if (!wrap || !btn) return;

    var FIELDS = ['car_type', 'pickup_location', 'pickup_date', 'return_date'];

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        var params = new URLSearchParams();
        FIELDS.forEach(function (name) {
            var field = wrap.querySelector('[name="' + name + '"]');
            if (field && field.value) params.set(name, field.value);
        });
        var qs = params.toString();
        window.location.href = '/fleet' + (qs ? '?' + qs : '');
    });
})();
