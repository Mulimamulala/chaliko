<?php
// Only process POST requests.
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Recipient email address for Chaliko Car Hire Limited.
    $recipient = "mulimam16@gmail.com";

    // Safely read a POST field without triggering undefined-key warnings.
    $field = function ($key) {
        return isset($_POST[$key]) ? trim($_POST[$key]) : '';
    };

    $name = strip_tags($field('full_name') !== '' ? $field('full_name') : $field('name'));
    $name = str_replace(array("\r", "\n"), array(" ", " "), $name);
    $email = filter_var($field('email'), FILTER_SANITIZE_EMAIL);
    $formType = strip_tags($field('form_type')) ?: 'Website Message';

    // Check that the minimum required data was sent.
    if (empty($name) or !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Oops! There was a problem with your submission. Please complete the form and try again.";
        exit;
    }

    // Set the email subject.
    $subject = "Chaliko Car Hire - $formType from $name";

    // Human-readable labels for the fields our forms may send.
    $labels = array(
        'phone' => 'Phone',
        'vehicle' => 'Vehicle',
        'pickup_date' => 'Pick-Up Date',
        'return_date' => 'Return Date',
        'pickup_location' => 'Pick-Up Location',
        'dropoff_location' => 'Drop-Off Location',
        'add_driver' => 'Professional Driver Requested',
        'licence_no' => "Driver's Licence No.",
        'payment_method' => 'Payment Method',
        'subject' => 'Subject',
        'car' => 'Car',
        'notes' => 'Notes',
        'message' => 'Message',
    );

    // Build the email content.
    $email_content = "Form: $formType\n";
    $email_content .= "Name: $name\n";
    $email_content .= "Email: $email\n";

    foreach ($labels as $key => $label) {
        if (!empty($_POST[$key])) {
            $value = strip_tags(trim($_POST[$key]));
            $value = str_replace(array("\r", "\n"), array(" ", " "), $value);
            $email_content .= "$label: $value\n";
        }
    }

    // Build the email headers. The visitor's address goes in Reply-To,
    // not From, so it can't be used to spoof the sending domain.
    $email_headers = "From: Chaliko Website <no-reply@chalikocarihire.co.zm>\r\n";
    $email_headers .= "Reply-To: $name <$email>";

    // Send the email.
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo "Thank you! Your message has been sent - we'll be in touch within 2 hours.";
    } else {
        http_response_code(500);
        echo "Oops! Something went wrong and we couldn't send your message. Please call us instead.";
    }
} else {
    // Not a POST request, set a 403 (forbidden) response code.
    http_response_code(403);
    echo "There was a problem with your submission, please try again.";
}
