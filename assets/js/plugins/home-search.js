(function () {
    var wrap = document.querySelector('.booking-search-form.booking-two');
    var btn = document.getElementById('home-search-btn');
    if (!wrap || !btn) return;

    var FIELDS = ['car_type', 'pickup_location', 'pickup_date', 'return_date'];

    // ---- Date fields ------------------------------------------------------
    // These are rendered as text inputs so they keep the "Pick Up Date" /
    // "Return Date" placeholders. On first interaction each one becomes a
    // native date input and opens the browser's own picker. This replaces
    // the old jQuery UI datepicker (v1.12.1, which had known XSS issues) and
    // produces YYYY-MM-DD values, the same format the /book form uses.
    var pickup = document.getElementById('home-search-pickup-date');
    var dropoff = document.getElementById('home-search-return-date');

    function isoDate(d) {
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + month + '-' + day;
    }

    function updateMinDates() {
        var today = isoDate(new Date());
        if (pickup) pickup.min = today;
        // Return can't be before pick-up (or before today if none chosen yet).
        if (dropoff) dropoff.min = (pickup && pickup.value) || today;
        if (dropoff && dropoff.value && dropoff.value < dropoff.min) dropoff.value = '';
    }

    function enhance(input) {
        if (!input) return;

        function toDate() {
            if (input.type === 'date') return;
            input.type = 'date';
            updateMinDates();
        }

        function openPicker() {
            toDate();
            // showPicker needs a user gesture and isn't in every browser;
            // where it's missing, focusing a date input still opens the
            // native picker on mobile, and desktop shows its own control.
            if (typeof input.showPicker === 'function') {
                try {
                    input.showPicker();
                } catch (err) {
                    /* not allowed in this context - the field is still usable */
                }
            }
        }

        input.addEventListener('focus', toDate);
        input.addEventListener('click', openPicker);
        input.addEventListener('blur', function () {
            // Revert to text when empty so the placeholder shows again.
            if (!input.value) input.type = 'text';
        });
        input.addEventListener('change', updateMinDates);
    }

    // The decorative calendar icon sits on top of the field; let clicks on it
    // open the picker too.
    [pickup, dropoff].forEach(function (input) {
        enhance(input);
        var icon = input && input.parentElement && input.parentElement.querySelector('.icon');
        if (icon) {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', function () {
                input.focus();
                input.click();
            });
        }
    });

    // ---- Search -----------------------------------------------------------
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
