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

    // --- Confirmation popup ---------------------------------------------
    // A small centered card confirms the submission so it can't be missed,
    // instead of relying solely on the easy-to-miss inline #form-messages
    // text below the submit button.
    var TOAST_STYLE_ID = 'cf-toast-styles';
    var TOAST_AUTO_DISMISS_MS = 6000;
    var toastTimer = null;

    function injectToastStyles() {
        if (document.getElementById(TOAST_STYLE_ID)) return;

        var css = [
            '.cf-toast-wrap{position:fixed;inset:0;z-index:999999;display:flex;',
            'align-items:center;justify-content:center;padding:16px;',
            'pointer-events:none;box-sizing:border-box;}',

            '.cf-toast{pointer-events:auto;display:flex;flex-direction:column;',
            'align-items:center;gap:14px;width:100%;max-width:280px;',
            'background:#fff;color:#143628;border-radius:16px;',
            'box-shadow:0 16px 48px rgba(20,54,40,0.22);padding:32px 24px;',
            'font-family:inherit;box-sizing:border-box;text-align:center;',
            'opacity:0;transform:scale(.9);',
            'transition:opacity .22s ease,transform .22s ease;}',

            '.cf-toast.cf-toast--show{opacity:1;transform:scale(1);}',

            '.cf-toast__title{font-size:17px;font-weight:700;margin:0;}',
            '.cf-toast__detail{font-size:13px;font-weight:400;color:#6b7280;',
            'margin:-6px 0 0;word-break:break-word;}',

            /* Animated tick (success). */
            '.cf-tick{width:60px;height:60px;flex-shrink:0;}',
            '.cf-tick__circle{fill:none;stroke:#1f8a4c;stroke-width:2;',
            'stroke-dasharray:152;stroke-dashoffset:152;',
            'animation:cfCircle .45s ease-out forwards;}',
            '.cf-tick__check{fill:none;stroke:#1f8a4c;stroke-width:3;',
            'stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:36;',
            'stroke-dashoffset:36;animation:cfCheck .35s .4s ease-out forwards;}',
            '@keyframes cfCircle{to{stroke-dashoffset:0;}}',
            '@keyframes cfCheck{to{stroke-dashoffset:0;}}',

            /* Simple mark (error) — scales in with the card, no draw effect. */
            '.cf-toast__icon--error{width:60px;height:60px;flex-shrink:0;',
            'border-radius:50%;background:#fdecea;color:#c62828;',
            'font-size:28px;font-weight:700;display:flex;align-items:center;',
            'justify-content:center;}',

            '@media (prefers-reduced-motion: reduce){',
            '.cf-toast{transition:opacity .01ms linear;}',
            '.cf-tick__circle,.cf-tick__check{animation:none;stroke-dashoffset:0;}',
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

    var TICK_SVG = '<svg class="cf-tick" viewBox="0 0 52 52" aria-hidden="true">' +
        '<circle class="cf-tick__circle" cx="26" cy="26" r="24"/>' +
        '<path class="cf-tick__check" d="M14 27l7 7 16-16"/>' +
        '</svg>';

    function showToast(message, isError) {
        var $wrap = getToastWrap();
        $wrap.empty();

        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }

        var $toast = $('<div class="cf-toast" role="status"></div>');

        if (isError) {
            $toast.append($('<span class="cf-toast__icon--error" aria-hidden="true">!</span>'));
            $toast.append($('<p class="cf-toast__title">Message not sent</p>'));
            $toast.append($('<p class="cf-toast__detail"></p>').text(message));
        } else {
            $toast.append($(TICK_SVG));
            $toast.append($('<p class="cf-toast__title">Message sent</p>'));
        }

        $toast.on('click', function () {
            dismissToast($toast);
        });

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
