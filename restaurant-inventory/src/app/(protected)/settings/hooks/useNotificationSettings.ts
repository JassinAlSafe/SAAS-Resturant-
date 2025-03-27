"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/services/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export interface NotificationPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    orderUpdates: boolean;
    inventoryAlerts: boolean;
    securityAlerts: boolean;
    billingNotifications: boolean;
}

export interface NotificationSchedule {
    quietHoursStart: string;
    quietHoursEnd: string;
    frequency: "immediate" | "hourly" | "daily";
    digestTime: string;
}

export function useNotificationSettings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Default notification preferences
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        orderUpdates: true,
        inventoryAlerts: true,
        securityAlerts: true,
        billingNotifications: true,
    });

    // Default schedule settings
    const [schedule, setSchedule] = useState<NotificationSchedule>({
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
        frequency: "immediate",
        digestTime: "09:00"
    });

    // Load notification preferences from database or localStorage
    useEffect(() => {
        setMounted(true);

        const loadPreferences = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // First try to load from database
                const { data, error } = await supabase
                    .from('notification_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    // PGRST116 is "no rows returned" error, which is fine for new users
                    console.error("Error loading notification preferences:", error);
                    throw error;
                }

                if (data) {
                    // If we have data from the database, use it
                    setPreferences({
                        emailNotifications: data.email_notifications ?? true,
                        pushNotifications: data.push_notifications ?? true,
                        marketingEmails: data.marketing_emails ?? false,
                        orderUpdates: data.order_updates ?? true,
                        inventoryAlerts: data.inventory_alerts ?? true,
                        securityAlerts: data.security_alerts ?? true,
                        billingNotifications: data.billing_notifications ?? true,
                    });

                    // Load schedule settings if available
                    if (data.quiet_hours_start) {
                        setSchedule({
                            quietHoursStart: data.quiet_hours_start,
                            quietHoursEnd: data.quiet_hours_end,
                            frequency: data.frequency || "immediate",
                            digestTime: data.digest_time || "09:00"
                        });
                    }
                } else {
                    // Otherwise, try to load from localStorage
                    const savedPreferences = localStorage.getItem('notificationPreferences');
                    if (savedPreferences) {
                        setPreferences(JSON.parse(savedPreferences));
                    }

                    const savedSchedule = localStorage.getItem('notificationSchedule');
                    if (savedSchedule) {
                        setSchedule(JSON.parse(savedSchedule));
                    }
                }
            } catch (error) {
                console.error("Failed to load notification preferences:", error);
                // Fallback to defaults
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, [user]);

    // Save preferences to localStorage when they change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
            localStorage.setItem('notificationSchedule', JSON.stringify(schedule));
        }
    }, [preferences, schedule, mounted]);

    // Update a single preference
    const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Update schedule settings
    const updateSchedule = (key: keyof NotificationSchedule, value: string) => {
        setSchedule(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Save all preferences to the database
    const savePreferences = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('notification_preferences')
                .upsert({
                    user_id: user.id,
                    email_notifications: preferences.emailNotifications,
                    push_notifications: preferences.pushNotifications,
                    marketing_emails: preferences.marketingEmails,
                    order_updates: preferences.orderUpdates,
                    inventory_alerts: preferences.inventoryAlerts,
                    security_alerts: preferences.securityAlerts,
                    billing_notifications: preferences.billingNotifications,
                    quiet_hours_start: schedule.quietHoursStart,
                    quiet_hours_end: schedule.quietHoursEnd,
                    frequency: schedule.frequency,
                    digest_time: schedule.digestTime,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            toast({
                title: "Preferences Saved",
                description: "Your notification preferences have been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving notification preferences:", error);
            toast({
                title: "Save Failed",
                description: "There was a problem saving your notification preferences.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Save only schedule settings
    const saveSchedule = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('notification_preferences')
                .upsert({
                    user_id: user.id,
                    quiet_hours_start: schedule.quietHoursStart,
                    quiet_hours_end: schedule.quietHoursEnd,
                    frequency: schedule.frequency,
                    digest_time: schedule.digestTime,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            toast({
                title: "Schedule Saved",
                description: "Your notification schedule has been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving notification schedule:", error);
            toast({
                title: "Save Failed",
                description: "There was a problem saving your notification schedule.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        preferences,
        updatePreference,
        schedule,
        updateSchedule,
        savePreferences,
        saveSchedule,
        isLoading,
        isSaving
    };
} 