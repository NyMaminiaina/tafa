<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // On restreint aux origines connues de notre propre frontend au lieu de '*'.
    // '*' autorisait n'importe quel site web à appeler notre API depuis le
    // navigateur d'un visiteur, ce qui est une mauvaise pratique de sécurité
    // (et incompatible en théorie avec supports_credentials=true).
    'allowed_origins' => array_filter(array_merge(
        [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ],
        explode(',', env('FRONTEND_URLS', ''))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
