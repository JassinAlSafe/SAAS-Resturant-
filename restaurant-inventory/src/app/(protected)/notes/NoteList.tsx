"use client";

import { useState } from "react";
import { Note, NoteTag } from "@/lib/types";
import {
  Pencil,
  Trash2,
  MessageSquare,
  Tag as TagIcon,
  Search,
} from "lucide-react";
import NoteForm from "./NoteForm";
import { StructuredNote } from "@/components/ui/Common/StructuredNote/structured-note";
import { format } from "date-fns";

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
    } fixed top-4 right-4 w-auto max-w-xs z-50 shadow-lg transition-opacity duration-300 opacity-0`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0");
      toast.classList.add("opacity-100");
    });

    // Fade out
    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const getTagByName = (tagName: string) => {
    return tags.find((tag) => tag.name === tagName);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Function to format note content as structured text with rich formatting
  const formatNoteContent = (content: string) => {
    if (!content) return <p className="text-gray-600">No content</p>;

    // Check if content has sections that need to be structured
    const hasBulletPoints = content.includes("•") || content.includes("- ");
    const hasNumberedList = /\d+\.\s/.test(content);
    const hasSubheadings = /\n\s*(\d+\.\s+[\w\s]+)/.test(content);

    if (!hasBulletPoints && !hasNumberedList && !hasSubheadings) {
      // Simple content without structure
      return <p className="text-lg leading-relaxed text-gray-600">{content}</p>;
    }

    // Format content with structured elements
    try {
      // Split content into paragraphs
      const paragraphs = content.split(/\n\n+/);

      return (
        <div className="space-y-4">
          {paragraphs.map((paragraph, idx) => {
            // Check if paragraph is a heading (starts with a number followed by period)
            if (/^\d+\.\s+[\w\s]+/.test(paragraph)) {
              const [heading, ...rest] = paragraph.split("\n");
              return (
                <div key={idx} className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {heading.trim()}
                  </h3>
                  {rest.length > 0 && (
                    <div className="mt-2">
                      {rest.map((line, lineIdx) => {
                        // Check if line is a bullet point
                        if (
                          line.trim().startsWith("• ") ||
                          line.trim().startsWith("- ")
                        ) {
                          const bulletContent = line.trim().substring(2);

                          // Check if bullet has a label (like "Key Points:" or "Products/Services:")
                          const labelMatch =
                            bulletContent.match(/^([^:]+):\s*(.*)/);

                          if (labelMatch) {
                            const [, label, value] = labelMatch;
                            return (
                              <div
                                key={lineIdx}
                                className="flex items-start my-2"
                              >
                                <span className="text-gray-700 mr-1.5">•</span>
                                <span className="font-semibold text-gray-800 mr-1">
                                  {label}:
                                </span>
                                <span className="text-gray-600">{value}</span>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={lineIdx}
                                className="flex items-start my-2"
                              >
                                <span className="text-gray-700 mr-1.5">•</span>
                                <span className="text-gray-600">
                                  {bulletContent}
                                </span>
                              </div>
                            );
                          }
                        }
                        return (
                          <p key={lineIdx} className="text-gray-600 my-2">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular paragraph
            return (
              <p key={idx} className="text-lg leading-relaxed text-gray-600">
                {paragraph}
              </p>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error("Error formatting note content:", error);
      return <p className="text-gray-600 whitespace-pre-line">{content}</p>;
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags &&
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-6">
          <div className="flex w-full max-w-md items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full py-2 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-white text-center">
            <MessageSquare
              className="h-12 w-12 text-gray-300 mb-3"
              strokeWidth={1.5}
            />
            <p className="text-gray-700 font-medium">No notes found</p>
            <p className="text-gray-500 text-sm mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <div key={note.id} className="w-full">
                {editingNoteId === note.id ? (
                  <div className="p-6 border rounded-lg bg-white shadow-sm">
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
                  <StructuredNote
                    title={note.title || "Untitled Note"}
                    authorName="You" // Replace with actual user info if available
                    date={formatDate(note.updatedAt || note.createdAt)}
                    className="author-tag-orange"
                    content={
                      <div className="space-y-4">
                        {formatNoteContent(note.content)}

                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500 mr-1 flex items-center">
                              <TagIcon className="h-3.5 w-3.5 mr-1.5" />
                              Tags:
                            </span>
                            {note.tags.map((tagName) => {
                              const tag = getTagByName(tagName);
                              return tag ? (
                                <span
                                  key={tagName}
                                  className="text-sm px-3 py-1 rounded-full"
                                  style={{
                                    backgroundColor: `${tag.color}20`,
                                    border: `1px solid ${tag.color}40`,
                                    color: tag.color,
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    }
                    isCollapsible={true}
                    defaultCollapsed={false}
                    onMoreClick={() => {
                      // Options menu goes here
                    }}
                    renderActions={() => (
                      <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
                        <button
                          className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => setEditingNoteId(note.id)}
                          aria-label="Edit note"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Note
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={() => setDeletingNoteId(note.id)}
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
