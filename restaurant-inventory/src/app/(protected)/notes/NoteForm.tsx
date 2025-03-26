"use client";

import { useState } from "react";
import { Tag, Check } from "lucide-react";
import { Note, NoteTag } from "@/lib/types";
import { useBusinessProfile } from "@/lib/business-profile-context";

interface NoteFormProps {
  note?: Note;
  tags: NoteTag[];
  onSubmit: (
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onCancel: () => void;
  entityType?: "general" | "inventory" | "supplier" | "sale";
  entityId?: string;
}

export default function NoteForm({
  note,
  tags,
  onSubmit,
  onCancel,
  entityType,
  entityId,
}: NoteFormProps) {
  const [content, setContent] = useState(note?.content || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const { profile } = useBusinessProfile();

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((name) => name !== tagName)
        : [...prev, tagName]
    );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      showToast("Note content cannot be empty", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const noteData = {
        content,
        tags: selectedTags,
        entityType: entityType || note?.entityType || "general",
        entityId: entityId || note?.entityId,
        createdBy: profile?.id || "",
      };

      await onSubmit(noteData);
    } catch (error) {
      console.error("Failed to save note:", error);
      showToast(`Failed to ${note ? "update" : "create"} note.`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-base-100">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">Note Content</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note here..."
          rows={4}
          className="textarea textarea-bordered w-full resize-none"
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </span>
        </label>

        <div className="relative">
          <div
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            className="input input-bordered py-2 px-3 min-h-[2.5rem] flex items-center flex-wrap gap-1 cursor-pointer"
          >
            {selectedTags.length > 0 ? (
              selectedTags.map((tagName) => {
                const tag = tags.find((t) => t.name === tagName);
                return tag ? (
                  <div
                    key={tag.id}
                    className="badge gap-1"
                    style={{
                      backgroundColor: tag.color,
                      color: "white",
                    }}
                  >
                    {tag.name}
                  </div>
                ) : null;
              })
            ) : (
              <span className="text-base-content text-opacity-50">
                Select tags...
              </span>
            )}
          </div>

          {isTagDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-base-100 border border-base-300 rounded-md shadow-lg z-50">
              <div className="p-2">
                <div className="text-xs text-base-content text-opacity-60 mb-2">
                  Click to select/deselect
                </div>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.name)}
                      className={`badge cursor-pointer ${
                        selectedTags.includes(tag.name) ? "" : "badge-outline"
                      }`}
                      style={{
                        backgroundColor: selectedTags.includes(tag.name)
                          ? tag.color
                          : "transparent",
                        borderColor: tag.color,
                        color: selectedTags.includes(tag.name)
                          ? "white"
                          : tag.color,
                      }}
                    >
                      {selectedTags.includes(tag.name) && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {tag.name}
                    </div>
                  ))}
                  {tags.length === 0 && (
                    <div className="text-sm text-base-content text-opacity-60 py-2">
                      No tags available
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-base-300 p-2 flex justify-end">
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => setIsTagDropdownOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end space-x-2">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Saving..." : note ? "Update Note" : "Add Note"}
        </button>
      </div>
    </form>
  );
}
