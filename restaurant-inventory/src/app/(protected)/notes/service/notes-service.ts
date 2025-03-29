import { Note, NoteTag } from "@/lib/types";
import { supabase } from "@/lib/supabase/browser-client";

// Cache for business profile ID to reduce redundant database calls
const businessProfileCache = {
    userId: null,
    profileId: null,
    timestamp: 0,
    expiryMs: 5 * 60 * 1000, // Cache expires after 5 minutes
};

// Notes service with performance optimizations
export const notesService = {
    // Get business profile ID with caching
    getBusinessProfileId: async (userId: string) => {
        const now = Date.now();

        // Return cached value if still valid
        if (
            businessProfileCache.userId === userId &&
            businessProfileCache.profileId &&
            now - businessProfileCache.timestamp < businessProfileCache.expiryMs
        ) {
            return businessProfileCache.profileId;
        }

        // Fetch the business profile ID
        const { data, error } = await supabase
            .from("business_profile_users")
            .select("business_profile_id")
            .eq("user_id", userId)
            .single();

        if (error) throw error;
        if (!data) throw new Error("No business profile found");

        // Update cache
        businessProfileCache.userId = userId;
        businessProfileCache.profileId = data.business_profile_id;
        businessProfileCache.timestamp = now;

        return data.business_profile_id;
    },

    // Get all notes
    getNotes: async (): Promise<Note[]> => {
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            // Use cached method to get business profile ID
            const businessProfileId = await notesService.getBusinessProfileId(profileData.user.id);

            // Fetch notes for the business profile
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .eq("business_profile_id", businessProfileId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Transform from snake_case to camelCase
            return (data || []).map(transformNoteFromDB);
        } catch (error) {
            console.error("Error fetching notes:", error);
            return []; // Return empty array on error
        }
    },

    // Get notes by entity type and optional entity ID
    getNotesByEntity: async (
        entityType: Note["entityType"],
        entityId?: string
    ): Promise<Note[]> => {
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            // Use cached method to get business profile ID
            const businessProfileId = await notesService.getBusinessProfileId(profileData.user.id);

            // Start the query
            let query = supabase
                .from("notes")
                .select("*")
                .eq("business_profile_id", businessProfileId)
                .eq("entity_type", entityType);

            // Add entity ID filter if provided
            if (entityId) {
                query = query.eq("entity_id", entityId);
            }

            // Execute query
            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;

            // Transform from snake_case to camelCase
            return (data || []).map(transformNoteFromDB);
        } catch (error) {
            console.error("Error fetching notes by entity:", error);
            return []; // Return empty array on error
        }
    },

    // Get notes by tag
    getNotesByTag: async (tag: string): Promise<Note[]> => {
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            // Use cached method to get business profile ID
            const businessProfileId = await notesService.getBusinessProfileId(profileData.user.id);

            // Fetch notes that contain the tag
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .eq("business_profile_id", businessProfileId)
                .contains("tags", [tag])
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Transform from snake_case to camelCase
            return (data || []).map(transformNoteFromDB);
        } catch (error) {
            console.error("Error fetching notes by tag:", error);
            return []; // Return empty array on error
        }
    },

    // Add a new note
    addNote: async (
        note: Omit<Note, "id" | "createdAt" | "updatedAt">
    ): Promise<Note> => {
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            // Use cached method to get business profile ID
            const businessProfileId = await notesService.getBusinessProfileId(profileData.user.id);

            // Insert the new note - Note: removed title field as it doesn't exist in schema
            const { data, error } = await supabase
                .from("notes")
                .insert({
                    title: note.title || '',
                    content: note.content,
                    tags: note.tags || [],
                    entity_type: note.entityType,
                    entity_id: note.entityId || null,
                    created_by: profileData.user.id,
                    business_profile_id: businessProfileId
                })
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("Failed to create note");

            // Transform from snake_case to camelCase
            return transformNoteFromDB(data);
        } catch (error) {
            console.error("Error adding note:", error);
            throw error;
        }
    },

    // Update a note
    updateNote: async (
        id: string,
        note: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>
    ): Promise<Note> => {
        try {
            // Prepare the update data (removed title field)
            const updateData: Record<string, any> = {};
            if (note.title !== undefined) updateData.title = note.title;
            if (note.content !== undefined) updateData.content = note.content;
            if (note.tags !== undefined) updateData.tags = note.tags;
            if (note.entityType !== undefined) updateData.entity_type = note.entityType;
            if (note.entityId !== undefined) updateData.entity_id = note.entityId;

            // Update the note
            const { data, error } = await supabase
                .from("notes")
                .update(updateData)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("Note not found or update failed");

            // Transform from snake_case to camelCase
            return transformNoteFromDB(data);
        } catch (error) {
            console.error("Error updating note:", error);
            throw error;
        }
    },

    // Delete a note
    deleteNote: async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from("notes")
                .delete()
                .eq("id", id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error("Error deleting note:", error);
            throw error;
        }
    },

    // Get all note tags
    getTags: async (): Promise<NoteTag[]> => {
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            // Use cached method to get business profile ID
            const businessProfileId = await notesService.getBusinessProfileId(profileData.user.id);

            // Fetch tags for the business profile
            const { data, error } = await supabase
                .from("note_tags")
                .select("*")
                .eq("business_profile_id", businessProfileId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Transform from snake_case to camelCase
            return (data || []).map(transformNoteTagFromDB);
        } catch (error) {
            console.error("Error fetching note tags:", error);
            return []; // Return empty array on error
        }
    },

    // Add a new note tag
    addTag: async (
        tag: Omit<NoteTag, "id" | "createdAt">
    ): Promise<NoteTag> => {
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            // Use cached method to get business profile ID
            const businessProfileId = await notesService.getBusinessProfileId(profileData.user.id);

            // Insert the new tag
            const { data, error } = await supabase
                .from("note_tags")
                .insert({
                    name: tag.name,
                    color: tag.color,
                    business_profile_id: businessProfileId
                })
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error("Failed to create tag");

            // Transform from snake_case to camelCase
            return transformNoteTagFromDB(data);
        } catch (error) {
            console.error("Error adding tag:", error);
            throw error;
        }
    },

    // Clear cache (useful for testing or when user changes)
    clearCache: () => {
        businessProfileCache.userId = null;
        businessProfileCache.profileId = null;
        businessProfileCache.timestamp = 0;
    }
};

// Helper function to transform note from database format to application format
function transformNoteFromDB(dbNote: Record<string, any>): Note {
    return {
        id: dbNote.id,
        // Use the title field from the database instead of empty string
        title: dbNote.title || '',
        content: dbNote.content,
        tags: dbNote.tags || [],
        entityType: dbNote.entity_type,
        entityId: dbNote.entity_id || undefined,
        createdBy: dbNote.created_by,
        createdAt: dbNote.created_at,
        updatedAt: dbNote.updated_at
    };
}

// Helper function to transform note tag from database format to application format
function transformNoteTagFromDB(dbTag: Record<string, any>): NoteTag {
    return {
        id: dbTag.id,
        name: dbTag.name,
        color: dbTag.color,
        createdAt: dbTag.created_at
    };
}