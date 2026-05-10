<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED_LOCALES = ['ar', 'en'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('locale')
            ?: $request->header('X-Locale')
            ?: $request->getPreferredLanguage(self::SUPPORTED_LOCALES)
            ?: config('app.locale');

        $locale = strtolower(substr((string) $locale, 0, 2));

        if (! in_array($locale, self::SUPPORTED_LOCALES, true)) {
            $locale = config('app.locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
