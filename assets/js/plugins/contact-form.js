/**
 *
 * Template : Go-Rental HTML TEMPLATE
 * Author : ThemeWant
 * Author URI : https://themewant.com/ 
 *
 **/

(function ($) {
    'use strict';
    // Get the form.
    var form = $('#contact-form');

    // Get the messages div.
    var formMessages = $('#form-messages');

    // --- Toast notification -------------------------------------------
    // Injected once per page so submissions get a visible, animated
    // confirmation instead of relying solely on the easy-to-miss inline
    // #form-messages text below the submit button.
    var TOAST_STYLE_ID = 'cf-toast-styles';
    var TOAST_AUTO_DISMISS_MS = 6000;
    var toastTimer = null;

    function injectToastStyles() {
        if (document.getElementById(TOAST_STYLE_ID)) return;

        var css = [
            '.cf-toast-wrap{position:fixed;top:16px;left:16px;right:16px;z-index:999999;',
            'display:flex;flex-direction:column;align-items:center;pointer-events:none;}',

            '.cf-toast{pointer-events:auto;display:flex;align-items:flex-start;gap:12px;',
            'width:100%;max-width:420px;background:#fff;color:#143628;border-radius:10px;',
            'box-shadow:0 12px 32px rgba(20,54,40,0.18);padding:14px 16px;',
            'font-family:inherit;font-size:14px;line-height:1.45;box-sizing:border-box;',
            'border-left:4px solid #143628;opacity:0;transform:translateY(-16px);',
            'transition:opacity .28s ease,transform .28s ease;}',

            '.cf-toast.cf-toast--show{opacity:1;transform:translateY(0);}',
            '.cf-toast.cf-toast--error{border-left-color:#c62828;}',

            '.cf-toast__icon{flex-shrink:0;width:22px;height:22px;border-radius:50%;',
            'display:flex;align-items:center;justify-content:center;font-size:12px;',
            'font-weight:700;color:#fff;background:#143628;margin-top:1px;}',
            '.cf-toast--error .cf-toast__icon{background:#c62828;}',

            '.cf-toast__body{flex:1;font-weight:500;word-break:break-word;}',

            '.cf-toast__close{flex-shrink:0;background:none;border:none;cursor:pointer;',
            'font-size:18px;line-height:1;color:#9aa39c;padding:0;margin:0;}',
            '.cf-toast__close:hover,.cf-toast__close:focus{color:#143628;}',

            /* Tablet and up: anchor top-right with a fixed width instead of a
               full-bleed banner. */
            '@media (min-width:641px){',
            '.cf-toast-wrap{left:auto;right:24px;top:24px;align-items:flex-end;}',
            '.cf-toast{width:380px;}',
            '}',

            '@media (prefers-reduced-motion: reduce){',
            '.cf-toast{transition:opacity .01ms linear;}',
            '}'
        ].join('');

        var style = document.createElement('style');
        style.id = TOAST_STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    function getToastWrap() {
        var $wrap = $('.cf-toast-wrap');
        if ($wrap.length) return $wrap;

        injectToastStyles();
        $wrap = $('<div class="cf-toast-wrap" aria-live="polite" aria-atomic="true"></div>');
        $(document.body).append($wrap);
        return $wrap;
    }

    function showToast(message, isError) {
        var $wrap = getToastWrap();
        $wrap.empty();

        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }

        var $toast = $('<div class="cf-toast" role="status"></div>');
        if (isError) $toast.addClass('cf-toast--error');

        var $icon = $('<span class="cf-toast__icon" aria-hidden="true"></span>').text(isError ? '!' : '✓');
        var $body = $('<span class="cf-toast__body"></span>').text(message);
        var $close = $('<button type="button" class="cf-toast__close" aria-label="Dismiss notification">&times;</button>');

        $close.on('click', function () {
            dismissToast($toast);
        });

        $toast.append($icon, $body, $close);
        $wrap.append($toast);

        // Force a reflow so the transition to the "show" state actually animates.
        void $toast[0].offsetWidth;
        $toast.addClass('cf-toast--show');

        toastTimer = setTimeout(function () {
            dismissToast($toast);
        }, TOAST_AUTO_DISMISS_MS);
    }

    function dismissToast($toast) {
        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }
        $toast.removeClass('cf-toast--show');
        setTimeout(function () {
            $toast.remove();
        }, 300);
    }
    // --------------------------------------------------------------------

    // Set up an event listener for the contact form.
    $(form).submit(function (e) {
        // Stop the browser from submitting the form.
        e.preventDefault();

        // Serialize the form data.
        var formData = $(form).serialize();

        // Submit the form using AJAX.
        $.ajax({
                type: 'POST',
                url: $(form).attr('action'),
                data: formData
            })
            .done(function (response) {
                // Make sure that the formMessages div has the 'success' class.
                $(formMessages).removeClass('error');
                $(formMessages).addClass('success');

                // Set the message text.
                $(formMessages).text(response);

                showToast(response, false);

                // Clear the form.
                $('#name, #email,  #car, #message').val('');
            })
            .fail(function (data) {
                // Make sure that the formMessages div has the 'error' class.
                $(formMessages).removeClass('success');
                $(formMessages).addClass('error');

                // Set the message text.
                var errorText = data.responseText !== '' ?
                    data.responseText :
                    'Oops! An error occured and your message could not be sent.';

                $(formMessages).text(errorText);

                showToast(errorText, true);
            });
    });

})(jQuery);
