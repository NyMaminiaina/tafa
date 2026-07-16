<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;

class UpdateLastActive
{
    /**
     * Update the user's last_active timestamp on each request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {
            $profile = $request->user()->profile;
            if ($profile) {
                try {
                    // Parse last_active as Carbon if it's a string
                    $lastActive = $profile->last_active;
                    if ($lastActive && is_string($lastActive)) {
                        $lastActive = Carbon::parse($lastActive);
                    }

                    // Only update if more than 1 minute has passed (to avoid too many DB writes)
                    if (!$lastActive || $lastActive->diffInMinutes(now()) >= 1) {
                        $profile->update(['last_active' => now()]);
                    }
                } catch (\Exception $e) {
                    // If any error, just update the timestamp
                    $profile->update(['last_active' => now()]);
                }
            }
        }

        return $next($request);
    }
}
