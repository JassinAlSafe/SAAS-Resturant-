import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { IngredientAlert } from '@/types/database.types';
import { getAlerts, acknowledgeAlert } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

export function useInventoryAlerts() {
    const [alerts, setAlerts] = useState<IngredientAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { userId } = useAuth();

    // Load initial alerts
    useEffect(() => {
        async function loadAlerts() {
            try {
                setLoading(true);
                const alertsData = await getAlerts(false);
                setAlerts(alertsData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load alerts'));
            } finally {
                setLoading(false);
            }
        }

        loadAlerts();
    }, []);

    // Set up real-time subscription
    useEffect(() => {
        const subscription = supabase
            .channel('ingredient_alerts_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'ingredient_alerts' },
                (payload) => {
                    // When a new alert comes in, fetch the full alert with ingredient data
                    supabase
                        .from('ingredient_alerts')
                        .select('*, ingredients(*)')
                        .eq('id', payload.new.id)
                        .single()
                        .then(({ data }) => {
                            if (data) {
                                setAlerts((currentAlerts) => [data, ...currentAlerts]);
                            }
                        });
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'ingredient_alerts' },
                (payload) => {
                    if (payload.new.acknowledged_at) {
                        // If alert was acknowledged, update it in our state
                        setAlerts((currentAlerts) =>
                            currentAlerts.map((alert) =>
                                alert.id === payload.new.id ? { ...alert, ...payload.new } : alert
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    // Function to acknowledge an alert
    const handleAcknowledgeAlert = async (alertId: string) => {
        if (!userId) {
            throw new Error('User must be logged in to acknowledge alerts');
        }

        try {
            await acknowledgeAlert(alertId, userId);

            // Filter out the acknowledged alert from the list
            setAlerts((currentAlerts) =>
                currentAlerts.filter((alert) => alert.id !== alertId)
            );

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to acknowledge alert'));
            return false;
        }
    };

    return {
        alerts,
        loading,
        error,
        acknowledgeAlert: handleAcknowledgeAlert
    };
} 