"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Note, NoteTag } from "@/lib/types";
import { notesServiceSupabase as notesService } from "@/lib/services/notes-service-supabase";
import { useNotificationHelpers } from "@/lib/notification-context";
import NoteForm from "./NoteForm";
import NoteList from "./NoteList";
import TagManager from "./TagManager";
import { useBusinessProfile } from "@/lib/business-profile-context";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [activeTab, setActiveTab] = useState("notes");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, isLoading: isLoadingProfile } = useBusinessProfile();
  const { success, error: showError } = useNotificationHelpers();

  // Fetch notes and tags
  const fetchNotesAndTags = async () => {
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
  };

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
  }, [profile, isLoadingProfile]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-md text-primary"></span>
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">
          Business Profile Required
        </h2>
        <p className="text-base-content text-opacity-60 mb-4">
          You need to set up a business profile to use the Notes feature.
        </p>
        <button
          onClick={() => (window.location.href = "/settings/business-profile")}
          className="btn btn-outline"
        >
          Set Up Business Profile
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notes & Communication</h1>
        <div className="flex space-x-2">
          {activeTab === "notes" && !isAddingNote && (
            <button
              onClick={() => setIsAddingNote(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </button>
          )}
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs tabs-boxed">
          <a
            className={`tab ${activeTab === "notes" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </a>
          <a
            className={`tab ${activeTab === "tags" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("tags")}
          >
            Tags
          </a>
        </div>

        <div className={`mt-6 ${activeTab === "notes" ? "block" : "hidden"}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div
                style={{ display: isAddingNote ? "block" : "none" }}
                data-note-form-container
              >
                <div className="card bg-base-100 shadow-sm mb-6">
                  <div className="card-body">
                    <h2 className="card-title text-lg">Add New Note</h2>
                    <NoteForm
                      tags={tags}
                      onSubmit={handleAddNote}
                      onCancel={() => setIsAddingNote(false)}
                    />
                  </div>
                </div>
              </div>

              {!isAddingNote && notes.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-lg">
                  <h3 className="font-medium mb-2">No notes yet</h3>
                  <p className="text-base-content text-opacity-60 mb-4">
                    Create your first note to get started
                  </p>
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </button>
                </div>
              ) : (
                <NoteList
                  notes={notes}
                  tags={tags}
                  onEdit={handleUpdateNote}
                  onDelete={handleDeleteNote}
                />
              )}
            </>
          )}
        </div>

        <div className={`mt-6 ${activeTab === "tags" ? "block" : "hidden"}`}>
          <div className="max-w-md mx-auto card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg">Manage Tags</h2>
              <TagManager tags={tags} onAddTag={handleAddTag} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
