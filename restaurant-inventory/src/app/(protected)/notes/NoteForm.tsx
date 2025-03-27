"use client";

import { useState } from "react";
import { Note, NoteTag } from "@/lib/types";
import { useBusinessProfile } from "@/lib/business-profile-context";
import { Tag, X } from "lucide-react";
import { FormButtons } from "@/components/ui/FormButtons/FormButtons";
import { TextField } from "@/components/ui/text/TextField";

interface NoteFormProps {
  note?: Note;
  tags: NoteTag[];
  onSubmit: (
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onCancel: () => void;
}

export default function NoteForm({
  note,
  tags,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useBusinessProfile();

  // Form validity check
  const isValid = title.trim() !== "" && content.trim() !== "";
  const isEditMode = !!note;

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("Note title cannot be empty", "error");
      return;
    }

    if (!content.trim()) {
      showToast("Note content cannot be empty", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const noteData = {
        title,
        content,
        tags: selectedTags,
        entityType: "general" as const,
        createdBy: profile?.id || "",
      };

      await onSubmit(noteData);
    } catch (error) {
      console.error("Failed to save note:", error);
      showToast(`Failed to ${isEditMode ? "update" : "create"} note.`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTagByName = (tagName: string) => {
    return tags.find((tag) => tag.name === tagName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-base-100">
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter note title..."
        maxLength={100}
        required
      />

      <TextField
        label="Note Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your note here..."
        multiline
        rows={4}
        required
      />

      {/* Simple Tag Selection */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </span>
        </label>

        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.length > 0 ? (
            selectedTags.map((tagName) => {
              const tag = getTagByName(tagName);
              return tag ? (
                <div
                  key={tag.id}
                  className="badge gap-1 text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : null;
            })
          ) : (
            <span className="text-base-content text-opacity-50">
              No tags selected
            </span>
          )}
        </div>

        <div className="border border-base-300 rounded-md p-2">
          <div className="text-xs text-base-content text-opacity-60 mb-2">
            Select tags:
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.name)}
                  className={`badge ${
                    selectedTags.includes(tag.name)
                      ? "text-white"
                      : "badge-outline"
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
                  {tag.name}
                </button>
              ))
            ) : (
              <span className="text-sm text-base-content text-opacity-60">
                No tags available
              </span>
            )}
          </div>
        </div>
      </div>

      <FormButtons
        isSubmitting={isSubmitting}
        isValid={isValid}
        isEditMode={isEditMode}
        onCancel={onCancel}
      />
    </form>
  );
}
