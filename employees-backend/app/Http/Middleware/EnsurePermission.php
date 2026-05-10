<?php

namespace App\Http\Middleware;

use App\Support\Permissions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (! Permissions::roleHas($request->user()?->role, $permission)) {
            return response()->json([
                'success' => false,
                'message' => __('messages.auth.forbidden'),
            ], 403);
        }

        return $next($request);
    }
}
