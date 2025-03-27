import { Note, NoteTag } from "@/lib/types";
import { supabase } from "@/lib/supabase/browser-client";

// Notes service
export const notesService = {
    // Get all notes
    getNotes: async (): Promise<Note[]> => {
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) throw businessError;
            if (!businessData) throw new Error("No business profile found");

            const businessProfileId = businessData.business_profile_id;

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

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) throw businessError;
            if (!businessData) throw new Error("No business profile found");

            const businessProfileId = businessData.business_profile_id;

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

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) throw businessError;
            if (!businessData) throw new Error("No business profile found");

            const businessProfileId = businessData.business_profile_id;

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

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) throw businessError;
            if (!businessData) throw new Error("No business profile found");

            const businessProfileId = businessData.business_profile_id;

            // Insert the new note
            const { data, error } = await supabase
                .from("notes")
                .insert({
                    content: note.content,
                    tags: note.tags,
                    entity_type: note.entityType,
                    entity_id: note.entityId,
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
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) throw new Error("User not authenticated");

            // Prepare the update data
            const updateData: any = {};
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

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) throw businessError;
            if (!businessData) throw new Error("No business profile found");

            const businessProfileId = businessData.business_profile_id;

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

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) throw businessError;
            if (!businessData) throw new Error("No business profile found");

            const businessProfileId = businessData.business_profile_id;

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
};

// Helper function to transform note from database format to application format
function transformNoteFromDB(dbNote: any): Note {
    return {
        id: dbNote.id,
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
function transformNoteTagFromDB(dbTag: any): NoteTag {
    return {
        id: dbTag.id,
        name: dbTag.name,
        color: dbTag.color,
        createdAt: dbTag.created_at
    };
}