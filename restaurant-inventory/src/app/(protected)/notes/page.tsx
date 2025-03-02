"use client";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiTag,
  FiFilter,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import Card from "@/components/Card";
import { Note, NoteTag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notesService } from "@/lib/services/notes-service";
import { useNotificationHelpers } from "@/lib/notification-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function Notes() {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Note form state
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteEntityType, setNoteEntityType] =
    useState<Note["entityType"]>("general");
  const [noteEntityId, setNoteEntityId] = useState("");
  const [noteTagsInput, setNoteTagsInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tag form state
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#6b7280");

  // Notifications
  const { success, error } = useNotificationHelpers();

  // Fetch notes and tags
  const fetchNotesAndTags = async () => {
    setIsLoading(true);
    try {
      // Get all notes
      const fetchedNotes = await notesService.getNotes();
      setNotes(fetchedNotes);

      // Get all tags
      const fetchedTags = await notesService.getTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error("Error fetching notes data:", err);
      error(
        "Failed to load notes",
        "There was an error loading your notes data."
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
        entityType: noteEntityType,
        entityId: noteEntityId || undefined,
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
        entityType: noteEntityType,
        entityId: noteEntityId || undefined,
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

  // Handle adding a new tag
  const handleAddTag = async () => {
    if (!tagName.trim()) {
      error("Error", "Please enter a tag name");
      return;
    }

    try {
      const newTag = await notesService.addTag({
        name: tagName.toLowerCase().replace(/\s+/g, "-"),
        color: tagColor,
      });

      setTags([...tags, newTag]);
      success("Tag Added", "Your tag has been added successfully.");
      resetTagForm();
    } catch (err) {
      console.error("Error adding tag:", err);
      error("Failed to add tag", "Please try again.");
    }
  };

  // Reset note form
  const resetNoteForm = () => {
    setIsNoteDialogOpen(false);
    setIsEditMode(false);
    setSelectedNote(null);
    setNoteContent("");
    setNoteEntityType("general");
    setNoteEntityId("");
    setNoteTagsInput("");
    setSelectedTags([]);
  };

  // Reset tag form
  const resetTagForm = () => {
    setIsTagDialogOpen(false);
    setTagName("");
    setTagColor("#6b7280");
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
    setNoteEntityType(note.entityType);
    setNoteEntityId(note.entityId || "");
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

  // Filter notes based on search term, entity type, and tag
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEntityType =
      selectedEntityType === "all" || note.entityType === selectedEntityType;
    const matchesTag = selectedTag === "all" || note.tags.includes(selectedTag);
    return matchesSearch && matchesEntityType && matchesTag;
  });

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
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36 mt-4 md:mt-0" />
        </div>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full md:w-48" />
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-2" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Notes & Staff Communication
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredNotes.length} notes in your system
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={fetchNotesAndTags}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTagDialogOpen(true)}
          >
            <FiTag className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
          <Button size="sm" onClick={openAddNoteDialog}>
            <FiPlus className="mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={selectedEntityType}
              onValueChange={(value) => setSelectedEntityType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Select
              value={selectedTag}
              onValueChange={(value) => setSelectedTag(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notes Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FiMessageSquare className="h-4 w-4" />
            Notes List
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Notes List View */}
        <TabsContent value="list">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No notes found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell className="font-medium max-w-md">
                          {note.content}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{note.entityType}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(note.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <Card className="p-6">
            <div className="space-y-8">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notes found matching your filters.
                </div>
              ) : (
                filteredNotes
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((note) => (
                    <div
                      key={note.id}
                      className="relative pl-8 pb-8 border-l border-gray-200"
                    >
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary"></div>
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <div className="bg-card p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary">{note.entityType}</Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-blue-600"
                              onClick={() => openEditNoteDialog(note)}
                              title="Edit note"
                            >
                              <FiEdit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600"
                              onClick={() => handleDeleteNote(note.id)}
                              title="Delete note"
                            >
                              <FiTrash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="mb-3">{note.content}</p>
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
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Note" : "Add New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="noteEntityType" className="text-right">
                Type
              </label>
              <Select
                value={noteEntityType}
                onValueChange={(value: Note["entityType"]) =>
                  setNoteEntityType(value)
                }
              >
                <SelectTrigger id="noteEntityType" className="col-span-3">
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="noteEntityId" className="text-right">
                Entity ID
              </label>
              <Input
                id="noteEntityId"
                placeholder="Optional entity ID"
                value={noteEntityId}
                onChange={(e) => setNoteEntityId(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="noteContent" className="text-right pt-2">
                Content
              </label>
              <Textarea
                id="noteContent"
                placeholder="Enter your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="col-span-3"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right pt-2">Tags</label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
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

      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tagName" className="text-right">
                Tag Name
              </label>
              <Input
                id="tagName"
                placeholder="Enter tag name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tagColor" className="text-right">
                Color
              </label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="color"
                  id="tagColor"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: tagColor }}
                ></div>
                <span>{tagColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetTagForm}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
