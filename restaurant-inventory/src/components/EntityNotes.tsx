"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMessageSquare } from "react-icons/fi";
import { Note, NoteTag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { notesService } from "@/lib/services/notes-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EntityNotesProps {
  entityType: Note["entityType"];
  entityId: string;
  entityName?: string;
}

export default function EntityNotes({
  entityType,
  entityId,
  entityName,
}: EntityNotesProps) {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Note form state
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Notifications
  const { success, error } = useNotificationHelpers();

  // Fetch notes and tags
  const fetchNotesAndTags = async () => {
    setIsLoading(true);
    try {
      // Get notes for this entity
      const fetchedNotes = await notesService.getNotesByEntity(
        entityType,
        entityId
      );
      setNotes(fetchedNotes);

      // Get all tags
      const fetchedTags = await notesService.getTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error("Error fetching notes data:", err);
      error(
        "Failed to load notes",
        "There was an error loading notes for this item."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new note
  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      error("Error", "Please enter note content");
      return;
    }

    try {
      const newNote = await notesService.addNote({
        content: noteContent,
        tags: selectedTags,
        entityType,
        entityId,
        createdBy: "user-1", // In a real app, this would be the current user's ID
      });

      setNotes([...notes, newNote]);
      success("Note Added", "Your note has been added successfully.");
      resetNoteForm();
    } catch (err) {
      console.error("Error adding note:", err);
      error("Failed to add note", "Please try again.");
    }
  };

  // Handle updating a note
  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    if (!noteContent.trim()) {
      error("Error", "Please enter note content");
      return;
    }

    try {
      const updatedNote = await notesService.updateNote(selectedNote.id, {
        content: noteContent,
        tags: selectedTags,
      });

      setNotes(
        notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      success("Note Updated", "Your note has been updated successfully.");
      resetNoteForm();
    } catch (err) {
      console.error("Error updating note:", err);
      error("Failed to update note", "Please try again.");
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesService.deleteNote(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      success("Note Deleted", "Your note has been deleted successfully.");
    } catch (err) {
      console.error("Error deleting note:", err);
      error("Failed to delete note", "Please try again.");
    }
  };

  // Reset note form
  const resetNoteForm = () => {
    setIsNoteDialogOpen(false);
    setIsEditMode(false);
    setSelectedNote(null);
    setNoteContent("");
    setSelectedTags([]);
  };

  // Open note dialog for adding a new note
  const openAddNoteDialog = () => {
    resetNoteForm();
    setIsNoteDialogOpen(true);
  };

  // Open note dialog for editing a note
  const openEditNoteDialog = (note: Note) => {
    setSelectedNote(note);
    setNoteContent(note.content);
    setSelectedTags(note.tags);
    setIsEditMode(true);
    setIsNoteDialogOpen(true);
  };

  // Handle tag selection in the note form
  const handleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Get tag color by name
  const getTagColor = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName);
    return tag ? tag.color : "#6b7280"; // Default to gray if tag not found
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  // Load notes and tags on component mount
  useEffect(() => {
    fetchNotesAndTags();
  }, [entityId, entityType]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Notes</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Notes {entityName ? `for ${entityName}` : ""}
        </h3>
        <Button size="sm" onClick={openAddNoteDialog}>
          <FiPlus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <FiMessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No notes yet</p>
          <Button
            variant="link"
            size="sm"
            className="mt-2"
            onClick={openAddNoteDialog}
          >
            Add your first note
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {notes
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((note) => (
              <div
                key={note.id}
                className="p-4 border rounded-md bg-card shadow-xs"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="flex items-center gap-1"
                        style={{
                          borderColor: getTagColor(tag),
                          color: getTagColor(tag),
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getTagColor(tag) }}
                        ></div>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                      onClick={() => openEditNoteDialog(note)}
                      title="Edit note"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDeleteNote(note.id)}
                      title="Delete note"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mb-2">{note.content}</p>
                <div className="text-xs text-muted-foreground">
                  {formatDate(note.createdAt)}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Note" : "Add New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Textarea
                placeholder="Enter your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.name) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedTags.includes(tag.name)
                        ? tag.color
                        : "transparent",
                      borderColor: tag.color,
                      color: selectedTags.includes(tag.name)
                        ? "white"
                        : tag.color,
                    }}
                    onClick={() => handleTagSelection(tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetNoteForm}>
              Cancel
            </Button>
            <Button onClick={isEditMode ? handleUpdateNote : handleAddNote}>
              {isEditMode ? "Update Note" : "Add Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
