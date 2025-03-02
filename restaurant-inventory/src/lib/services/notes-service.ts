import { Note, NoteTag } from "@/lib/types";

// Mock data for notes
const mockNotes: Note[] = [
    {
        id: "note-1",
        content: "Need to order more flour by next Tuesday",
        tags: ["urgent", "inventory"],
        entityType: "inventory",
        entityId: "inv-1", // Reference to Flour inventory item
        createdBy: "user-1",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        id: "note-2",
        content: "Supplier delayed olive oil shipment until next week",
        tags: ["supplier-delay", "important"],
        entityType: "supplier",
        entityId: "sup-3", // Reference to olive oil supplier
        createdBy: "user-2",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: "note-3",
        content: "Sales were higher than expected this weekend, adjust inventory accordingly",
        tags: ["sales", "inventory"],
        entityType: "sale",
        entityId: "sale-weekend-1",
        createdBy: "user-1",
        createdAt: new Date().toISOString(), // Today
        updatedAt: new Date().toISOString(),
    },
    {
        id: "note-4",
        content: "Team meeting on Friday to discuss new menu items",
        tags: ["general", "team"],
        entityType: "general",
        createdBy: "user-3",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
];

// Mock data for note tags
const mockNoteTags: NoteTag[] = [
    {
        id: "tag-1",
        name: "urgent",
        color: "#ef4444", // Red
        createdAt: new Date().toISOString(),
    },
    {
        id: "tag-2",
        name: "important",
        color: "#f97316", // Orange
        createdAt: new Date().toISOString(),
    },
    {
        id: "tag-3",
        name: "supplier-delay",
        color: "#eab308", // Yellow
        createdAt: new Date().toISOString(),
    },
    {
        id: "tag-4",
        name: "inventory",
        color: "#22c55e", // Green
        createdAt: new Date().toISOString(),
    },
    {
        id: "tag-5",
        name: "sales",
        color: "#3b82f6", // Blue
        createdAt: new Date().toISOString(),
    },
    {
        id: "tag-6",
        name: "team",
        color: "#8b5cf6", // Purple
        createdAt: new Date().toISOString(),
    },
    {
        id: "tag-7",
        name: "general",
        color: "#6b7280", // Gray
        createdAt: new Date().toISOString(),
    },
];

// Notes service
export const notesService = {
    // Get all notes
    getNotes: async (): Promise<Note[]> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockNotes);
            }, 500);
        });
    },

    // Get notes by entity type and optional entity ID
    getNotesByEntity: async (
        entityType: Note["entityType"],
        entityId?: string
    ): Promise<Note[]> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                let filteredNotes = mockNotes.filter(
                    (note) => note.entityType === entityType
                );

                if (entityId) {
                    filteredNotes = filteredNotes.filter(
                        (note) => note.entityId === entityId
                    );
                }

                resolve(filteredNotes);
            }, 500);
        });
    },

    // Get notes by tag
    getNotesByTag: async (tag: string): Promise<Note[]> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const filteredNotes = mockNotes.filter((note) =>
                    note.tags.includes(tag)
                );
                resolve(filteredNotes);
            }, 500);
        });
    },

    // Add a new note
    addNote: async (
        note: Omit<Note, "id" | "createdAt" | "updatedAt">
    ): Promise<Note> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const newNote: Note = {
                    ...note,
                    id: `note-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                // In a real app, this would update the database
                mockNotes.push(newNote);

                resolve(newNote);
            }, 300);
        });
    },

    // Update a note
    updateNote: async (
        id: string,
        note: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>
    ): Promise<Note> => {
        // In a real app, this would be an API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const noteIndex = mockNotes.findIndex((n) => n.id === id);
                if (noteIndex === -1) {
                    reject(new Error("Note not found"));
                    return;
                }

                const updatedNote: Note = {
                    ...mockNotes[noteIndex],
                    ...note,
                    updatedAt: new Date().toISOString(),
                };

                // In a real app, this would update the database
                mockNotes[noteIndex] = updatedNote;

                resolve(updatedNote);
            }, 300);
        });
    },

    // Delete a note
    deleteNote: async (id: string): Promise<boolean> => {
        // In a real app, this would be an API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const noteIndex = mockNotes.findIndex((n) => n.id === id);
                if (noteIndex === -1) {
                    reject(new Error("Note not found"));
                    return;
                }

                // In a real app, this would update the database
                mockNotes.splice(noteIndex, 1);

                resolve(true);
            }, 300);
        });
    },

    // Get all note tags
    getTags: async (): Promise<NoteTag[]> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockNoteTags);
            }, 500);
        });
    },

    // Add a new note tag
    addTag: async (
        tag: Omit<NoteTag, "id" | "createdAt">
    ): Promise<NoteTag> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTag: NoteTag = {
                    ...tag,
                    id: `tag-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };

                // In a real app, this would update the database
                mockNoteTags.push(newTag);

                resolve(newTag);
            }, 300);
        });
    },

    // Delete a note tag
    deleteTag: async (id: string): Promise<boolean> => {
        // In a real app, this would be an API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const tagIndex = mockNoteTags.findIndex((t) => t.id === id);
                if (tagIndex === -1) {
                    reject(new Error("Tag not found"));
                    return;
                }

                // In a real app, this would update the database
                mockNoteTags.splice(tagIndex, 1);

                resolve(true);
            }, 300);
        });
    },
}; 