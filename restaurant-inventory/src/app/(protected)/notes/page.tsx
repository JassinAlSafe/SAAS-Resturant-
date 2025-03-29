"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Tag as TagIcon, Search, X, Loader2 } from "lucide-react";
import { Note, NoteTag } from "@/lib/types";
import { notesServiceSupabase as notesService } from "@/app/(protected)/notes/service/notes-service-supabase";
import { useNotificationHelpers } from "@/lib/notification-context";
import NoteForm from "./NoteForm";
import NoteList from "./NoteList";
import TagManager from "./TagManager";
import { useBusinessProfile } from "@/lib/business-profile-context";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { profile, isLoading: isLoadingProfile } = useBusinessProfile();
  const { success, error: showError } = useNotificationHelpers();
  const tagModalRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const addNoteRef = useRef<HTMLDivElement>(null);

  // Fetch notes and tags
  const fetchNotesAndTags = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const [fetchedNotes, fetchedTags] = await Promise.all([
        notesService.getNotes(),
        notesService.getTags(),
      ]);
      setNotes(fetchedNotes);
      setTags(fetchedTags);
    } catch (err) {
      console.error("Failed to load notes and tags:", err);
      setError("Failed to load notes. Please try again later.");
      showError("Error", "Failed to load notes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Handle adding a new note
  const handleAddNote = async (
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newNote = await notesService.addNote(note);
      setNotes((prev) => [newNote, ...prev]);
      setIsAddingNote(false);
      success("Note Added", "Your note has been added successfully.");
    } catch (err) {
      console.error("Failed to add note:", err);
      showError("Error", "Failed to add note. Please try again.");
    }
  };

  // Handle updating a note
  const handleUpdateNote = async (note: Partial<Note>) => {
    if (!note.id) return;
    try {
      const { id, ...updateData } = note;
      const updatedNote = await notesService.updateNote(id, updateData);
      setNotes((prev) =>
        prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
      );
      success("Note Updated", "Your note has been updated successfully.");
    } catch (err) {
      console.error("Failed to update note:", err);
      throw err;
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      success("Note Deleted", "Your note has been deleted successfully.");
    } catch (err) {
      console.error("Failed to delete note:", err);
      throw err;
    }
  };

  // Handle adding a new tag
  const handleAddTag = async (tag: Omit<NoteTag, "id">) => {
    try {
      const newTag = await notesService.addTag(tag);
      setTags((prev) => [...prev, newTag]);
      success("Tag Added", "Your tag has been added successfully.");
    } catch (err) {
      console.error("Failed to add tag:", err);
      throw err;
    }
  };

  // Load notes and tags on component mount
  useEffect(() => {
    if (!isLoadingProfile && profile) {
      fetchNotesAndTags();
    } else if (!isLoadingProfile && !profile) {
      setIsLoading(false);
    }
  }, [profile, isLoadingProfile, fetchNotesAndTags]);

  // Filter notes based on search term and selected tag
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchTerm
      ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesTag = selectedTag ? note.tags?.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  // Scroll to add note form when opened
  useEffect(() => {
    if (isAddingNote && addNoteRef.current) {
      setTimeout(() => {
        addNoteRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [isAddingNote]);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const openTagModal = () => {
    if (tagModalRef.current) {
      tagModalRef.current.showModal();
    }
  };

  const closeTagModal = () => {
    if (tagModalRef.current) {
      tagModalRef.current.close();
    }
  };

  const handleTagFilter = (tagName: string) => {
    setSelectedTag(selectedTag === tagName ? null : tagName);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
    setIsSearchExpanded(false);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="text-base-content text-opacity-70">
          Loading profile...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 px-4 bg-base-100 rounded-xl shadow-sm max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center">
            <TagIcon className="h-8 w-8 text-primary text-opacity-60" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-3">
          Business Profile Required
        </h2>
        <p className="text-base-content text-opacity-70 mb-6 max-w-sm mx-auto">
          You need to set up a business profile to use the Notes feature. This
          allows us to properly organize your notes and data.
        </p>
        <button
          onClick={() => (window.location.href = "/settings/business-profile")}
          className="btn btn-primary btn-lg"
        >
          Set Up Business Profile
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-6xl">
      {/* Header section */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-base-content">Notes</h1>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openTagModal}
              className="btn btn-outline btn-sm sm:btn-md gap-1"
            >
              <TagIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Manage Tags</span>
              <span className="inline sm:hidden">Tags</span>
            </button>

            <div className="relative">
              <button
                onClick={toggleSearch}
                className="btn btn-outline btn-sm sm:btn-md"
                aria-label="Search notes"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Search</span>
              </button>

              {isSearchExpanded && (
                <div className="absolute top-full right-0 mt-2 bg-base-100 rounded-lg shadow-lg p-4 z-10 w-72 border border-base-300 animate-in fade-in slide-in-from-top-5 duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search notes..."
                      className="input input-bordered w-full py-2 h-10"
                    />
                    <button
                      onClick={() => setSearchTerm("")}
                      className="btn btn-circle btn-ghost btn-xs"
                      aria-label="Clear search"
                      style={{ visibility: searchTerm ? "visible" : "hidden" }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-base-content text-opacity-70 mb-1">
                        Filter by tag
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagFilter(tag.name)}
                            className={`text-xs px-2 py-1 rounded-full transition-all ${
                              selectedTag === tag.name
                                ? "text-white"
                                : "text-base-content text-opacity-70 bg-base-200 hover:bg-base-300"
                            }`}
                            style={{
                              backgroundColor:
                                selectedTag === tag.name
                                  ? tag.color
                                  : undefined,
                            }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(searchTerm || selectedTag) && (
                    <div className="mt-3 pt-3 border-t border-base-200">
                      <button
                        onClick={clearFilters}
                        className="btn btn-xs btn-ghost text-xs w-full"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isAddingNote && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="btn btn-primary btn-sm sm:btn-md"
              >
                <Plus className="h-4 w-4" />
                <span>Add Note</span>
              </button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        {(searchTerm || selectedTag) && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-base-200 rounded-lg animate-in fade-in duration-300">
            <span className="text-sm text-base-content text-opacity-70">
              Active filters:
            </span>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <div className="badge badge-sm gap-1">
                  <span>&quot;{searchTerm}&quot;</span>
                  <button onClick={() => setSearchTerm("")} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {selectedTag && (
                <div className="badge badge-sm gap-1">
                  <span>Tag: {selectedTag}</span>
                  <button onClick={() => setSelectedTag(null)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Tag Management Dialog */}
      <dialog
        ref={tagModalRef}
        id="tag_management_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-4">Manage Tags</h3>
          <TagManager
            tags={tags}
            onAddTag={async (tag) => {
              try {
                await handleAddTag(tag);
                // Refresh tags after adding
                const fetchedTags = await notesService.getTags();
                setTags(fetchedTags);
              } catch (err) {
                console.error("Failed to add tag:", err);
              }
            }}
          />
          <div className="modal-action mt-6">
            <button className="btn btn-primary" onClick={closeTagModal}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeTagModal}>close</button>
        </form>
      </dialog>

      {/* Main content area */}
      <div className="bg-base-100 rounded-xl shadow-sm transition-all">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-base-content text-opacity-70">
              Loading your notes...
            </p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Add Note Form */}
            <div
              ref={addNoteRef}
              className={`transition-all duration-300 ${
                isAddingNote
                  ? "max-h-[1000px] opacity-100 p-6 mb-6 border-b border-base-200"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
              data-note-form-container
            >
              <div className="bg-base-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Create New Note</h2>
                  <button
                    onClick={() => setIsAddingNote(false)}
                    className="btn btn-circle btn-ghost btn-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <NoteForm
                  tags={tags}
                  onSubmit={handleAddNote}
                  onCancel={() => setIsAddingNote(false)}
                />
              </div>
            </div>

            {/* Note List or Empty State */}
            <div className="p-4 sm:p-6">
              {!isAddingNote && notes.length === 0 ? (
                <div className="text-center py-16 px-4 bg-base-200 rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center">
                      <TagIcon className="h-8 w-8 text-primary text-opacity-60" />
                    </div>
                  </div>
                  <h3 className="font-medium text-lg mb-2">No notes yet</h3>
                  <p className="text-base-content text-opacity-70 mb-6 max-w-sm mx-auto">
                    Create your first note to start organizing your thoughts and
                    information
                  </p>
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Note
                  </button>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-12 px-4 bg-base-200 rounded-lg">
                  <Search className="h-12 w-12 mx-auto text-base-content text-opacity-30 mb-3" />
                  <h3 className="font-medium mb-2">No matching notes found</h3>
                  <p className="text-base-content text-opacity-70 mb-4">
                    Try adjusting your search or filters to find what
                    you&apos;re looking for
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline btn-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <NoteList
                  notes={filteredNotes}
                  tags={tags}
                  onEdit={handleUpdateNote}
                  onDelete={handleDeleteNote}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
