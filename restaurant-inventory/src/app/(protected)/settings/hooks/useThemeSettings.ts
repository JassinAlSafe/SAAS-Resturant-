import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/services/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export interface ThemeSettings {
    fontSize: "small" | "medium" | "large";
    compactMode: boolean;
    stickyHeader: boolean;
    animations: boolean;
}

export function useThemeSettings() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Theme settings with defaults
    const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
    const [compactMode, setCompactMode] = useState(false);
    const [stickyHeader, setStickyHeader] = useState(true);
    const [animations, setAnimations] = useState(true);

    // Load settings from database or localStorage
    useEffect(() => {
        setMounted(true);

        const loadSettings = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // First try to load from database
                const { data, error } = await supabase
                    .from('theme_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    // PGRST116 is "no rows returned" error, which is fine for new users
                    console.error("Error loading theme settings:", error);
                    throw error;
                }

                if (data) {
                    // If we have data from the database, use it
                    setFontSize(data.font_size || "medium");
                    setCompactMode(data.compact_mode || false);
                    setStickyHeader(data.sticky_header || true);
                    setAnimations(data.animations || true);
                } else {
                    // Otherwise, try to load from localStorage
                    const savedFontSize = localStorage.getItem("fontSize");
                    if (savedFontSize) {
                        setFontSize(savedFontSize as "small" | "medium" | "large");
                    }

                    const savedCompactMode = localStorage.getItem("compactMode");
                    if (savedCompactMode) {
                        setCompactMode(savedCompactMode === "true");
                    }

                    const savedStickyHeader = localStorage.getItem("stickyHeader");
                    if (savedStickyHeader) {
                        setStickyHeader(savedStickyHeader === "true");
                    }

                    const savedAnimations = localStorage.getItem("animations");
                    if (savedAnimations) {
                        setAnimations(savedAnimations === "true");
                    }
                }
            } catch (error) {
                console.error("Failed to load theme settings:", error);
                // Fallback to defaults
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [user]);

    // Save settings to localStorage when they change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("fontSize", fontSize);
            localStorage.setItem("compactMode", compactMode.toString());
            localStorage.setItem("stickyHeader", stickyHeader.toString());
            localStorage.setItem("animations", animations.toString());

            // Apply font size to the document
            document.documentElement.dataset.fontSize = fontSize;

            // Apply compact mode
            if (compactMode) {
                document.documentElement.classList.add("compact-mode");
            } else {
                document.documentElement.classList.remove("compact-mode");
            }

            // Apply animations setting
            if (!animations) {
                document.documentElement.classList.add("no-animations");
            } else {
                document.documentElement.classList.remove("no-animations");
            }
        }
    }, [fontSize, compactMode, stickyHeader, animations, mounted]);

    // Save settings to the database
    const saveSettings = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('theme_settings')
                .upsert({
                    user_id: user.id,
                    font_size: fontSize,
                    compact_mode: compactMode,
                    sticky_header: stickyHeader,
                    animations: animations,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            toast({
                title: "Settings Saved",
                description: "Your theme settings have been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving theme settings:", error);
            toast({
                title: "Save Failed",
                description: "There was a problem saving your theme settings.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        theme,
        setTheme,
        fontSize,
        setFontSize,
        compactMode,
        setCompactMode,
        stickyHeader,
        setStickyHeader,
        animations,
        setAnimations,
        mounted,
        saveSettings,
        isLoading,
        isSaving
    };
} 