"use client";

import { useState } from "react";
import { Note, NoteTag } from "@/lib/types";
import { Pencil, Trash2, MessageSquare } from "lucide-react";
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  const getTagByName = (tagName: string) => {
    return tags.find((tag) => tag.name === tagName);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags &&
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    return matchesSearch;
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
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-base-content text-opacity-60">
          <MessageSquare className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-2">No notes found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-sm">
            <thead className="bg-base-200">
              <tr className="text-base-content text-opacity-70">
                <th className="w-[20%] font-medium">Title</th>
                <th className="w-[35%] font-medium">Content</th>
                <th className="w-[20%] font-medium">Tags</th>
                <th className="w-[15%] font-medium">Created</th>
                <th className="w-[10%] text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note) => (
                <tr
                  key={note.id}
                  className="border-b border-base-300 hover:bg-base-200"
                >
                  {editingNoteId === note.id ? (
                    <td colSpan={5} className="p-2">
                      <NoteForm
                        note={note}
                        tags={tags}
                        onSubmit={async (updatedNote) => {
                          await onEdit({ ...updatedNote, id: note.id });
                          setEditingNoteId(null);
                        }}
                        onCancel={() => setEditingNoteId(null)}
                      />
                    </td>
                  ) : (
                    <>
                      <td className="align-top py-4 font-medium">
                        {note.title}
                      </td>
                      <td className="align-top py-4">
                        <div className="whitespace-pre-wrap break-words">
                          {note.content}
                        </div>
                      </td>
                      <td className="align-top py-4">
                        {note.tags && note.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
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
                        ) : (
                          <span className="text-base-content text-opacity-40">
                            -
                          </span>
                        )}
                      </td>
                      <td className="align-top py-4 text-sm text-base-content text-opacity-70">
                        {formatDate(note.updatedAt || note.createdAt)}
                      </td>
                      <td className="align-top py-4 text-center">
                        <div className="flex justify-center space-x-1">
                          <button
                            className="btn btn-ghost btn-xs text-blue-500 hover:bg-blue-50"
                            onClick={() => setEditingNoteId(note.id)}
                            aria-label="Edit note"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50"
                            onClick={() => setDeletingNoteId(note.id)}
                            aria-label="Delete note"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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
