<?php

declare(strict_types=1);

// Composer runs on the build machine. Releases include its production autoloader.
require dirname(__DIR__) . '/vendor/autoload.php';
date_default_timezone_set('UTC');
