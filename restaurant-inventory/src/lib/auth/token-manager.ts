import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Handle refresh token errors gracefully
 */
export async function handleRefreshTokenError(error: AuthError): Promise<boolean> {
    // Check if the error is related to refresh token
    const isRefreshTokenError =
        error.message.includes('token') ||
        error.message.includes('jwt') ||
        error.message.includes('refresh');

    if (!isRefreshTokenError) {
        return false;
    }

    try {
        console.warn('Handling refresh token error:', error.message);

        // Try to get a new session
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !data.session) {
            console.error('Failed to get session after refresh error:', sessionError);
            return false;
        }

        console.log('Successfully recovered session after refresh error');
        return true;
    } catch (handlerError) {
        console.error('Error handling refresh token error:', handlerError);
        return false;
    }
}
