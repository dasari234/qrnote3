'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        const handleAuthHash = async () => {
            // 1. Extract hash fragments from the browser window object
            const hash = window.location.hash;
            if (!hash) {
                // Fallback if no hash exists
                router.push('/sign-in');
                return;
            }

            // Convert hash string fields into a usable object
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                // 2. Explicitly establish the session using the tokens
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (error) {
                    toast.error(`Authentication failed: ${error.message}`);
                    router.push('/sign-in');
                    return;
                }

                toast.success('Successfully authenticated!');

                // 3. Extract the target location from your URL search parameters
                const urlParams = new URLSearchParams(window.location.search);
                const rawRedirect = urlParams.get('redirect') || '/dashboard';
                const targetRoute = decodeURIComponent(rawRedirect);

                // Refresh Server Components and route the user safely
                router.refresh();
                router.push(targetRoute);
            } else {
                router.push('/sign-in');
            }
        };

        handleAuthHash();
    }, [router, supabase]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-2">
                <p className="animate-pulse text-muted-foreground text-sm">Verifying your invitation token...</p>
            </div>
        </div>
    );
}
