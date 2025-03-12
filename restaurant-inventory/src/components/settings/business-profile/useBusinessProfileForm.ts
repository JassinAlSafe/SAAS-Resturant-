import { useState, useEffect } from "react";
import { BusinessProfile } from "@/lib/types";
import { CurrencyCode, CURRENCIES } from "@/lib/currency-context";
import { businessProfileService } from "@/lib/services/business-profile-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import { useBusinessProfile } from "@/lib/business-profile-context";
import { useCurrency } from "@/lib/currency-provider";

export function useBusinessProfileForm(userId: string) {
    const {
        success: showSuccess,
        error: showError,
        info: showInfo,
    } = useNotificationHelpers();
    const { setCurrency } = useCurrency();
    const { refreshProfile } = useBusinessProfile();
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<BusinessProfile | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState<BusinessProfile["type"]>("casual_dining");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [operatingHours, setOperatingHours] = useState<
        BusinessProfile["operatingHours"]
    >({
        monday: { open: "09:00", close: "17:00", closed: false },
        tuesday: { open: "09:00", close: "17:00", closed: false },
        wednesday: { open: "09:00", close: "17:00", closed: false },
        thursday: { open: "09:00", close: "17:00", closed: false },
        friday: { open: "09:00", close: "17:00", closed: false },
        saturday: { open: "10:00", close: "15:00", closed: false },
        sunday: { open: "10:00", close: "15:00", closed: true },
    });
    const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>("SEK");
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [taxRate, setTaxRate] = useState(0);
    const [taxEnabled, setTaxEnabled] = useState(false);
    const [taxName, setTaxName] = useState("");

    // Fetch business profile
    useEffect(() => {
        const fetchBusinessProfile = async () => {
            setIsLoading(true);
            try {
                const fetchedProfile = await businessProfileService.getBusinessProfile(userId);
                if (fetchedProfile) {
                    setProfile(fetchedProfile);
                    setName(fetchedProfile.name);
                    setType(fetchedProfile.type);
                    setAddress(fetchedProfile.address);
                    setCity(fetchedProfile.city);
                    setState(fetchedProfile.state);
                    setZipCode(fetchedProfile.zipCode);
                    setCountry(fetchedProfile.country);
                    setPhone(fetchedProfile.phone);
                    setEmail(fetchedProfile.email);
                    setWebsite(fetchedProfile.website);
                    setOperatingHours(fetchedProfile.operatingHours);
                    setDefaultCurrency(fetchedProfile.defaultCurrency as CurrencyCode);
                    setTaxRate(fetchedProfile.taxRate || 0);
                    setTaxEnabled(fetchedProfile.taxEnabled || false);
                    setTaxName(fetchedProfile.taxName || "");

                    if (fetchedProfile.logo) {
                        setLogoPreview(fetchedProfile.logo);
                    }
                }
            } catch (error) {
                console.error("Error fetching business profile:", error);
                showError(
                    "Profile Load Failed",
                    "There was a problem loading your business profile."
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchBusinessProfile();
        }
    }, [userId, showError]);

    // Handle profile update
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!profile) throw new Error("No profile loaded");

            const updatedProfile = await businessProfileService.updateBusinessProfile(
                profile.id,
                {
                    name,
                    type,
                    address,
                    city,
                    state,
                    zipCode,
                    country,
                    phone,
                    email,
                    website,
                }
            );

            setProfile(updatedProfile);
            showSuccess(
                "Profile Updated",
                "Your business profile has been updated successfully."
            );

            // Refresh the profile context
            await refreshProfile();
        } catch (error) {
            console.error("Error updating business profile:", error);
            showError(
                "Update Failed",
                "There was a problem updating your business profile."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle hours update
    const handleHoursUpdate = async (
        day: keyof BusinessProfile["operatingHours"],
        field: "open" | "close" | "closed",
        value: string | boolean
    ) => {
        // Update local state first
        const updatedHours = {
            ...operatingHours,
            [day]: {
                ...operatingHours[day],
                [field]: value,
            },
        };
        setOperatingHours(updatedHours);

        // Then update in the database
        try {
            if (!profile) return;

            setIsLoading(true);
            const updatedProfile = await businessProfileService.updateBusinessProfile(
                profile.id,
                {
                    operatingHours: updatedHours,
                }
            );

            setProfile(updatedProfile);
            showSuccess(
                "Hours Updated",
                "Your operating hours have been updated successfully."
            );

            // Refresh the profile context
            await refreshProfile();
        } catch (error) {
            console.error("Error updating operating hours:", error);
            showError(
                "Update Failed",
                "There was a problem updating your operating hours."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle currency update
    const handleCurrencyUpdate = async (currency: CurrencyCode) => {
        setDefaultCurrency(currency);

        try {
            if (!profile) return;

            setIsLoading(true);
            const updatedProfile = await businessProfileService.updateDefaultCurrency(
                profile.id,
                currency
            );

            setProfile(updatedProfile);

            // Update the app-wide currency context
            setCurrency({
                ...CURRENCIES[currency],
                code: currency
            });

            showSuccess(
                "Currency Updated",
                `Your default currency has been set to ${CURRENCIES[currency].name}.`
            );
        } catch (error) {
            console.error("Error updating currency:", error);
            showError(
                "Update Failed",
                "There was a problem updating your default currency."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle tax update
    const handleTaxUpdate = async (
        field: "taxRate" | "taxEnabled" | "taxName",
        value: number | boolean | string
    ) => {
        // Update local state first
        const updatedTax = {
            rate: field === 'taxRate' ? value as number : profile?.taxSettings.rate ?? 0,
            enabled: field === 'taxEnabled' ? value as boolean : profile?.taxSettings.enabled ?? false,
            name: field === 'taxName' ? value as string : profile?.taxSettings.name ?? ''
        };
        setProfile(prevProfile => {
            if (!prevProfile) return null;
            return {
                ...prevProfile,
                taxSettings: updatedTax
            };
        });

        // Then update in the database
        try {
            if (!profile) return;

            setIsLoading(true);
            const updatedProfile = await businessProfileService.updateTaxSettings(
                profile.id,
                updatedTax
            );

            setProfile(updatedProfile);
            showSuccess(
                "Tax Settings Updated",
                "Your tax settings have been updated successfully."
            );

            // Refresh the profile context
            await refreshProfile();
        } catch (error) {
            console.error("Error updating tax settings:", error);
            showError(
                "Update Failed",
                "There was a problem updating your tax settings."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle logo upload
    const handleLogoUpload = async (file: File) => {
        if (!file) return;

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 5) {
            showError("Upload Failed", "Image size must be less than 5MB.");
            return;
        }

        // Validate file type
        const validTypes = [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
            "image/svg+xml",
        ];
        if (!validTypes.includes(file.type)) {
            showError(
                "Invalid File Type",
                `File type "${file.type}" is not supported. Please use PNG, JPEG, GIF, WebP, or SVG.`
            );
            return;
        }

        setIsLoading(true);
        showInfo("Uploading...", "Please wait while we upload your logo.");

        try {
            // Use the placeholder implementation for now
            showInfo(
                "Using Placeholder",
                "Using a placeholder image while storage setup is being configured."
            );

            // Upload the logo using the placeholder implementation
            const updatedProfile = await businessProfileService.uploadLogo(
                userId,
                file
            );

            setProfile(updatedProfile);
            setLogoPreview(updatedProfile.logo || null);
            showSuccess(
                "Logo Updated",
                "Your restaurant logo has been updated with a placeholder image and will now appear in the sidebar navigation."
            );

            // Refresh the profile context to update the sidebar
            await refreshProfile();
        } catch (error) {
            console.error("Error uploading logo:", error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            showError(
                "Upload Failed",
                `There was a problem updating your logo: ${errorMessage}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        profile,
        name,
        setName,
        type,
        setType,
        address,
        setAddress,
        city,
        setCity,
        state,
        setState,
        zipCode,
        setZipCode,
        country,
        setCountry,
        phone,
        setPhone,
        email,
        setEmail,
        website,
        setWebsite,
        operatingHours,
        setOperatingHours,
        defaultCurrency,
        setDefaultCurrency,
        logoPreview,
        taxRate,
        setTaxRate,
        taxEnabled,
        setTaxEnabled,
        taxName,
        setTaxName,
        handleProfileUpdate,
        handleHoursUpdate,
        handleCurrencyUpdate,
        handleTaxUpdate,
        handleLogoUpload,
    };
} 