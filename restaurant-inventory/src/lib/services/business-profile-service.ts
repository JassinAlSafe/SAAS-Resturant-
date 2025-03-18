// Import service modules
import { profileBasicService } from './profile/profile-basic-service';
import { profileHoursService } from './profile/profile-hours-service';
import { profileTaxService } from './profile/profile-tax-service';
import { profileMediaService } from './profile/profile-media-service';
import { profileCache } from '@/lib/utils/business-profile-utils';

/**
 * Business Profile Service
 * Acts as a facade for all profile-related services
 */
export const businessProfileService = {
    // Core operations
    ...profileBasicService,

    // Operating hours operations
    ...profileHoursService,

    // Tax settings operations
    ...profileTaxService,

    // Media operations
    ...profileMediaService,

    // Cache management
    clearCache: () => {
        profileCache.clear();
    }
};
