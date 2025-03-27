import { Note, NoteTag } from "@/lib/types";
import { supabase } from "@/lib/supabase/browser-client";

// Notes service with Supabase integration
export const notesServiceSupabase = {
    // Get all notes for the current user's business profile
    getNotes: async (): Promise<Note[]> => {
        console.log("getNotes called");
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            console.log("Auth user data:", profileData);

            if (!profileData.user) {
                console.error("User not authenticated");
                throw new Error("User not authenticated");
            }

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) {
                console.error("Business profile error:", businessError);
                throw businessError;
            }

            if (!businessData) {
                console.error("No business profile found for user", profileData.user.id);
                throw new Error("No business profile found");
            }

            const businessProfileId = businessData.business_profile_id;
            console.log("Business profile ID for fetching notes:", businessProfileId);

            // Fetch notes for the business profile
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .eq("business_profile_id", businessProfileId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching notes:", error);
                throw error;
            }

            console.log("Raw notes data from Supabase:", data);
            // Transform from snake_case to camelCase
            const transformedNotes = (data || []).map(transformNoteFromDB);
            console.log("Transformed notes:", transformedNotes);
            return transformedNotes;
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
        console.log("addNote called with", note);
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            console.log("Auth user data for adding note:", profileData?.user?.id);

            if (!profileData.user) {
                console.error("User not authenticated");
                throw new Error("User not authenticated");
            }

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) {
                console.error("Business profile error when adding note:", businessError);
                throw businessError;
            }

            if (!businessData) {
                console.error("No business profile found when adding note");
                throw new Error("No business profile found");
            }

            const businessProfileId = businessData.business_profile_id;
            console.log("Business profile ID for new note:", businessProfileId);

            // Insert the new note
            const newNote = {
                title: note.title,
                content: note.content,
                tags: note.tags,
                entity_type: note.entityType,
                entity_id: note.entityId,
                created_by: profileData.user.id,
                business_profile_id: businessProfileId
            };

            console.log("Inserting new note:", newNote);

            const { data, error } = await supabase
                .from("notes")
                .insert(newNote)
                .select()
                .single();

            if (error) {
                console.error("Error adding note:", error);
                throw error;
            }

            if (!data) {
                console.error("Failed to create note - no data returned");
                throw new Error("Failed to create note");
            }

            console.log("New note data from Supabase:", data);
            // Transform from snake_case to camelCase
            const transformedNote = transformNoteFromDB(data);
            console.log("Transformed new note:", transformedNote);
            return transformedNote;
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
        console.log("addTag called with:", tag);
        try {
            // Get the user's business profile ID
            const { data: profileData } = await supabase.auth.getUser();
            if (!profileData.user) {
                console.error("User not authenticated when adding tag");
                throw new Error("User not authenticated");
            }

            const { data: businessData, error: businessError } = await supabase
                .from("business_profile_users")
                .select("business_profile_id")
                .eq("user_id", profileData.user.id)
                .single();

            if (businessError) {
                console.error("Business profile error when adding tag:", businessError);
                throw businessError;
            }
            if (!businessData) {
                console.error("No business profile found when adding tag");
                throw new Error("No business profile found");
            }

            const businessProfileId = businessData.business_profile_id;
            console.log("Business profile ID for new tag:", businessProfileId);

            // Create the tag data
            const tagData = {
                name: tag.name,
                color: tag.color,
                business_profile_id: businessProfileId
            };

            console.log("Inserting new tag:", tagData);

            // Insert the new tag
            const { data, error } = await supabase
                .from("note_tags")
                .insert(tagData)
                .select()
                .single();

            if (error) {
                console.error("Error adding tag:", error);
                throw error;
            }
            if (!data) {
                console.error("Failed to create tag - no data returned");
                throw new Error("Failed to create tag");
            }

            console.log("New tag data from Supabase:", data);
            // Transform from snake_case to camelCase
            const transformedTag = transformNoteTagFromDB(data);
            console.log("Transformed new tag:", transformedTag);
            return transformedTag;
        } catch (error) {
            console.error("Error adding tag:", error);
            throw error;
        }
    },
};

// Helper function to transform note from database format to application format
function transformNoteFromDB(dbNote: Record<string, any>): Note {
    return {
        id: dbNote.id,
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