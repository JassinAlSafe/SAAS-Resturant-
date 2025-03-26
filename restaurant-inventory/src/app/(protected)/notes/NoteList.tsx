"use client";

import { useState } from "react";
import { Note, NoteTag } from "@/lib/types";
import { Pencil, Trash2, Calendar, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NoteForm from "./NoteForm";

interface NoteListProps {
  notes: Note[];
  tags: NoteTag[];
  onEdit: (note: Partial<Note>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function NoteList({
  notes,
  tags,
  onEdit,
  onDelete,
}: NoteListProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterEntity, setFilterEntity] = useState<string>("");

  const handleDelete = async () => {
    if (!deletingNoteId) return;

    try {
      await onDelete(deletingNoteId);
      showToast("Note deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete note:", error);
      showToast("Failed to delete note. Please try again.", "error");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    const toast = document.createElement("div");
    toast.className = `alert ${
      type === "success" ? "alert-success" : "alert-error"
    } fixed top-4 right-4 w-auto max-w-xs z-50`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-300");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const getTagByName = (tagName: string) => {
    return tags.find((tag) => tag.name === tagName);
  };

  const getUniqueEntityTypes = () => {
    const entityTypes = notes.map((note) => note.entityType).filter(Boolean);
    return [...new Set(entityTypes)];
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTag =
      !filterTag || (note.tags && note.tags.includes(filterTag));
    const matchesEntity = !filterEntity || note.entityType === filterEntity;

    return matchesSearch && matchesTag && matchesEntity;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="flex space-x-2">
          <select
            className="select select-bordered w-[150px]"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-[150px]"
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
          >
            <option value="">All Entities</option>
            {getUniqueEntityTypes().map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-base-content text-opacity-60">
          <MessageSquare className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-2">No notes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="card bg-base-100 shadow-sm flex flex-col h-full"
            >
              {editingNoteId === note.id ? (
                <div className="card-body">
                  <NoteForm
                    note={note}
                    tags={tags}
                    onSubmit={async (updatedNote) => {
                      await onEdit({ ...updatedNote, id: note.id });
                      setEditingNoteId(null);
                    }}
                    onCancel={() => setEditingNoteId(null)}
                  />
                </div>
              ) : (
                <div className="card-body flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      {note.entityType && (
                        <div className="badge badge-outline mb-1">
                          {note.entityType}
                          {note.entityId ? ` #${note.entityId}` : ""}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={() => setEditingNoteId(note.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={() => setDeletingNoteId(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="py-2 flex-grow">
                    <p className="whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 mt-auto">
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((tagName) => {
                          const tag = getTagByName(tagName);
                          return tag ? (
                            <div
                              key={tagName}
                              className="badge badge-sm"
                              style={{
                                backgroundColor: tag.color,
                                color: "white",
                              }}
                            >
                              {tag.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-base-content text-opacity-60">
                      <Calendar className="h-3 w-3 mr-1" />
                      {note.updatedAt
                        ? `Updated ${formatDistanceToNow(
                            new Date(note.updatedAt),
                            {
                              addSuffix: true,
                            }
                          )}`
                        : formatDistanceToNow(new Date(note.createdAt), {
                            addSuffix: true,
                          })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <dialog
        id="delete_modal"
        className={`modal ${deletingNoteId ? "modal-open" : ""}`}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you sure?</h3>
          <p className="py-4">
            This action cannot be undone. This will permanently delete the note.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-outline"
              onClick={() => setDeletingNoteId(null)}
            >
              Cancel
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setDeletingNoteId(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
