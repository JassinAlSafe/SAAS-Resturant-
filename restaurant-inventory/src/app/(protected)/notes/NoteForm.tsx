"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Note, NoteTag } from "@/lib/types";
import { useBusinessProfile } from "@/lib/business-profile-context";
import { Tag, X, Save, AlertCircle } from "lucide-react";
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
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {}
  );
  const [showTagSelector, setShowTagSelector] = useState(false);

  // Get business profile context - we'll use getProfileId for better performance
  const { profile, getProfileId } = useBusinessProfile();

  // Prevent unnecessary re-renders with useRef for toast functionality
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use ref to track if the component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Memoized validation
  useEffect(() => {
    const newErrors: { title?: string; content?: string } = {};

    if (title.trim() && title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (content.trim() && content.trim().length < 5) {
      newErrors.content = "Content must be at least 5 characters";
    }

    setErrors(newErrors);
  }, [title, content]);

  // Form validity check - memoized to prevent recalculation on every render
  const isValid = useMemo(
    () =>
      title.trim() !== "" &&
      content.trim() !== "" &&
      Object.keys(errors).length === 0,
    [title, content, errors]
  );

  // Is this form for editing an existing note?
  const isEditMode = !!note;

  // Optimized tag toggle with useCallback
  const handleTagToggle = useCallback((tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  }, []);

  // Optimized toast function
  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      // Clear any existing toast timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      // Remove any existing toasts
      const existingToasts = document.querySelectorAll(".note-form-toast");
      existingToasts.forEach((toast) => {
        document.body.removeChild(toast);
      });

      // Create new toast
      const toast = document.createElement("div");
      toast.className = `note-form-toast alert ${
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
      toastTimeoutRef.current = setTimeout(() => {
        if (document.body.contains(toast)) {
          toast.classList.remove("opacity-100");
          toast.classList.add("opacity-0");
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }
      }, 3000);
    },
    []
  );

  // Optimized submit handler with proper cleanup
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

    if (Object.keys(errors).length > 0) {
      showToast("Please fix form errors before submitting", "error");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Get profile ID efficiently
      const profileId = getProfileId?.() || profile?.id || "";

      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        entityType: "general" as const,
        createdBy: profileId,
      };

      await onSubmit(noteData);

      // Only proceed with UI updates if component is still mounted
      if (isMountedRef.current) {
        // Success! Clear form or close
        if (!isEditMode) {
          setTitle("");
          setContent("");
          setSelectedTags([]);
        }
      }
    } catch (error) {
      console.error("Failed to save note:", error);

      // Only show toast if component is still mounted
      if (isMountedRef.current) {
        showToast(
          `Failed to ${isEditMode ? "update" : "create"} note.`,
          "error"
        );
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Memoized tag lookup function
  const getTagByName = useCallback(
    (tagName: string) => {
      return tags.find((tag) => tag.name === tagName);
    },
    [tags]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Field */}
      <div className="space-y-1">
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a descriptive title..."
          maxLength={100}
          required
          className={`${errors.title ? "input-error" : ""}`}
        />
        {errors.title && (
          <div className="text-sm text-error flex items-center gap-1.5 mt-1 px-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errors.title}</span>
          </div>
        )}
        <div className="text-xs text-right text-base-content text-opacity-70">
          {title.length}/100
        </div>
      </div>

      {/* Content Field */}
      <div className="space-y-1">
        <TextField
          label="Note Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          multiline
          rows={6}
          required
          className={`${errors.content ? "input-error" : ""} 
                     min-h-[120px] transition-all duration-200 focus:min-h-[200px]`}
        />
        {errors.content && (
          <div className="text-sm text-error flex items-center gap-1.5 mt-1 px-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errors.content}</span>
          </div>
        )}
      </div>

      {/* Tag Selection UI */}
      <div className="rounded-lg border border-base-300 p-4 space-y-3 bg-base-100">
        <div className="flex justify-between items-center">
          <label className="font-medium flex items-center text-base-content">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </label>
          <button
            type="button"
            onClick={() => setShowTagSelector(!showTagSelector)}
            className="btn btn-ghost btn-xs flex items-center gap-1"
          >
            {showTagSelector ? "Hide" : "Show"} tags
          </button>
        </div>

        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2 min-h-[30px]">
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
                    aria-label={`Remove ${tag.name} tag`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : null;
            })
          ) : (
            <span className="text-sm text-base-content text-opacity-50 py-1">
              No tags selected
            </span>
          )}
        </div>

        {/* Tag Selector - only render content when visible for performance */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showTagSelector
              ? "max-h-[250px] opacity-100 pt-3 border-t border-base-200"
              : "max-h-0 opacity-0"
          }`}
        >
          {showTagSelector &&
            (tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`transition-all duration-200 badge badge-md ${
                      selectedTags.includes(tag.name)
                        ? "text-white shadow-sm transform hover:scale-105"
                        : "badge-outline transform hover:scale-105 hover:shadow-sm"
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
                ))}
              </div>
            ) : (
              <div className="text-center py-3">
                <span className="text-sm text-base-content text-opacity-60">
                  No tags available. Create tags in tag management.
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-3 border-t border-base-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={`btn ${isSubmitting ? "btn-disabled" : "btn-primary"}`}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              <span>{isEditMode ? "Updating..." : "Creating..."}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              <span>{isEditMode ? "Update" : "Create"} Note</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
