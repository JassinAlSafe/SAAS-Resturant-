"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Tag as TagIcon,
  X,
  Save,
  Clock,
  Check,
} from "lucide-react";
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
import { notesService } from "@/app/(protected)/notes/service/notes-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

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
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(
    null
  );

  // Note form state
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      // Generate default title if empty
      const title = noteTitle.trim() || `Note for ${entityName || entityType}`;

      const newNote = await notesService.addNote({
        // Now directly use the title field as it is supported in the database
        title: title,
        content: noteContent,
        tags: selectedTags,
        entityType,
        entityId,
        // In a real app, get the current user's ID
        createdBy: "user-1",
      });

      setNotes([newNote, ...notes]);
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
      // Generate default title if empty
      const title =
        noteTitle.trim() ||
        selectedNote.title ||
        `Note for ${entityName || entityType}`;

      const updatedNote = await notesService.updateNote(selectedNote.id, {
        title: title,
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
      setShowConfirmDelete(null);
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
    setNoteTitle("");
    setNoteContent("");
    setSelectedTags([]);
  };

  // Parse content to extract title and actual content - simplified since we now have a title field
  const parseContent = (content: string) => {
    // For backward compatibility, still check if content has an embedded title
    const titleMatch = content.match(/^\*\*(.*?)\*\*\n\n([\s\S]*)$/);

    if (titleMatch) {
      return {
        extractedTitle: titleMatch[1],
        cleanContent: titleMatch[2],
      };
    }

    return {
      extractedTitle: "",
      cleanContent: content,
    };
  };

  // Open note dialog for adding a new note
  const openAddNoteDialog = () => {
    resetNoteForm();
    setNoteTitle(`Note for ${entityName || entityType}`);
    setIsNoteDialogOpen(true);
    // Focus the textarea after dialog is open
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Open note dialog for editing a note
  const openEditNoteDialog = (note: Note) => {
    setSelectedNote(note);

    // Parse content to extract title and content
    const { extractedTitle, cleanContent } = parseContent(note.content);

    setNoteTitle(extractedTitle || note.title || "");
    setNoteContent(cleanContent);
    setSelectedTags(note.tags);
    setIsEditMode(true);
    setIsNoteDialogOpen(true);

    // Focus the textarea after dialog is open
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Handle tag selection in the note form
  const handleTagSelection = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Get tag color by name
  const getTagColor = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName);
    return tag ? tag.color : "#6b7280"; // Default to gray if tag not found
  };

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  // Check if date is recent (less than 24 hours)
  const isRecent = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    return now.getTime() - date.getTime() < 24 * 60 * 60 * 1000;
  };

  // Render note content with title field - simplified since title is now a separate field
  const renderNoteContent = (note: Note) => {
    // For backward compatibility, check if there might be a title in the content
    const { extractedTitle, cleanContent } = parseContent(note.content);

    return (
      <>
        {/* Prefer the database title field, fallback to extracted title if needed */}
        {(note.title || extractedTitle) && (
          <h3 className="font-medium text-lg mb-2">
            {note.title || extractedTitle}
          </h3>
        )}
        <div className="whitespace-pre-wrap">{cleanContent}</div>
      </>
    );
  };

  // Load notes and tags on component mount
  useEffect(() => {
    fetchNotesAndTags();
  }, [entityId, entityType]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {notes.length > 0 ? `Notes (${notes.length})` : "Notes"}
          {entityName ? (
            <span className="text-muted-foreground text-sm font-normal ml-1">
              for {entityName}
            </span>
          ) : (
            ""
          )}
        </h3>
        <Button
          size="sm"
          onClick={openAddNoteDialog}
          className="rounded-full gap-1.5 px-3 h-9"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-muted/10 text-center">
          <MessageSquare
            className="h-10 w-10 text-muted-foreground/50 mb-3"
            strokeWidth={1.25}
          />
          <p className="text-muted-foreground mb-4">No notes yet</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={openAddNoteDialog}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add your first note
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notes
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Note content area with extracted title */}
                  <div className="mb-3">{renderNoteContent(note)}</div>

                  {/* Tags and actions area */}
                  <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.length > 0 ? (
                        note.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs py-0 h-5 rounded-full"
                            style={{
                              backgroundColor: `${getTagColor(tag)}20`, // 20% opacity
                              borderColor: getTagColor(tag),
                              color: getTagColor(tag),
                            }}
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No tags
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Timestamp */}
                      <TooltipProvider>
                        <Tooltip content={formatDate(note.createdAt)}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{getRelativeTime(note.createdAt)}</span>
                              {isRecent(note.createdAt) && (
                                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{formatDate(note.createdAt)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip content="Edit note">
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                onClick={() => openEditNoteDialog(note)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit note</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {showConfirmDelete === note.id ? (
                          <div className="flex items-center bg-destructive/10 rounded-full px-2 py-0.5 animate-in fade-in slide-in-from-right-2 duration-200">
                            <span className="text-xs text-destructive mr-1.5">
                              Confirm?
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-destructive/20 text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full text-muted-foreground"
                              onClick={() => setShowConfirmDelete(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <TooltipProvider>
                            <Tooltip content="Delete note">
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                  onClick={() => setShowConfirmDelete(note.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete note</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Note Dialog */}
      <Dialog
        open={isNoteDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetNoteForm();
          else setIsNoteDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditMode ? "Edit Note" : "Add New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            {/* Title Field (stored in content) */}
            <div className="relative">
              <label className="text-sm font-medium mb-2 block">Title</label>
              <input
                type="text"
                placeholder="Enter a title for your note..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Content Field */}
            <div className="relative">
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                ref={textareaRef}
                placeholder="Write your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
                className="resize-none focus-visible:ring-1 focus-visible:ring-offset-1 transition-all min-h-[120px]"
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {noteContent.length} characters
              </div>
            </div>

            {/* Tags Field */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <TagIcon className="h-3.5 w-3.5" />
                Tags
              </label>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={
                        selectedTags.includes(tag.name) ? "default" : "outline"
                      }
                      className="cursor-pointer transition-all hover:scale-105"
                      style={{
                        backgroundColor: selectedTags.includes(tag.name)
                          ? tag.color
                          : `${tag.color}10`, // 10% opacity background when not selected
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
              ) : (
                <div className="text-sm text-muted-foreground mt-2">
                  No tags available. Create tags in the tag management section.
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={resetNoteForm}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={isEditMode ? handleUpdateNote : handleAddNote}
              className="rounded-full gap-1.5"
              disabled={!noteContent.trim()}
            >
              {isEditMode ? (
                <>
                  <Save className="h-4 w-4" />
                  Update Note
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Note
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
