(function () {
    var details = document.querySelector('.filter-dropdown');
    if (!details) return;
    if (window.matchMedia('(min-width: 768px)').matches) {
        details.setAttribute('open', '');
    }
    var currentLabel = details.querySelector('.filter-current');
    details.querySelectorAll('button[data-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            currentLabel.textContent = btn.textContent;
            if (window.matchMedia('(max-width: 767px)').matches) {
                details.removeAttribute('open');
            }
        });
    });
})();

(function () {
    var bar = document.querySelector('.fleet-filter-sticky');
    var spacer = document.querySelector('.fleet-filter-spacer');
    var header = document.querySelector('.header-inner');
    if (!bar || !spacer || !header) return;

    function onScroll() {
        var headerHeight = header.offsetHeight;
        if (!bar.classList.contains('is-pinned')) {
            if (bar.getBoundingClientRect().top <= headerHeight) {
                spacer.style.height = bar.offsetHeight + 'px';
                bar.style.top = headerHeight + 'px';
                bar.classList.add('is-pinned');
            }
        } else {
            bar.style.top = headerHeight + 'px';
            if (spacer.getBoundingClientRect().top > headerHeight) {
                bar.classList.remove('is-pinned');
                bar.style.top = '';
                spacer.style.height = '0px';
            }
        }
    }

    function onResize() {
        var wasPinned = bar.classList.contains('is-pinned');
        if (wasPinned) {
            bar.classList.remove('is-pinned');
            bar.style.top = '';
            spacer.style.height = '0px';
        }
        onScroll();
    }

    onScroll();
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
})();
