"use client";

import { useState, useRef } from "react";
import { NoteTag } from "@/lib/types";
import {
  Tag,
  Plus,
  X,
  Check,
  AlertCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface TagManagerProps {
  tags: NoteTag[];
  onAddTag: (tag: Omit<NoteTag, "id">) => Promise<void>;
  onDeleteTag?: (id: string) => Promise<void>;
}

export default function TagManager({
  tags,
  onAddTag,
  onDeleteTag,
}: TagManagerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const deleteModalRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const colorOptions = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#6B7280", // gray
    "#000000", // black
  ];

  const openModal = () => {
    setNewTagName("");
    setNewTagColor("#3B82F6");
    setFormError(null);
    if (modalRef.current) {
      modalRef.current.showModal();
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
  };

  const openDeleteModal = (tagId: string) => {
    setDeletingTagId(tagId);
    if (deleteModalRef.current) {
      deleteModalRef.current.showModal();
    }
  };

  const closeDeleteModal = () => {
    setDeletingTagId(null);
    if (deleteModalRef.current) {
      deleteModalRef.current.close();
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
    setTimeout(() => {
      toast.classList.remove("opacity-0");
      toast.classList.add("opacity-100");
    }, 10);

    // Fade out
    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const validateForm = (): boolean => {
    setFormError(null);

    if (!newTagName.trim()) {
      setFormError("Tag name cannot be empty");
      return false;
    }

    if (newTagName.trim().length < 2) {
      setFormError("Tag name must be at least 2 characters");
      return false;
    }

    if (newTagName.trim().length > 20) {
      setFormError("Tag name must be less than 20 characters");
      return false;
    }

    if (
      tags.some(
        (tag) => tag.name.toLowerCase() === newTagName.toLowerCase().trim()
      )
    ) {
      setFormError("A tag with this name already exists");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddTag({
        name: newTagName.trim(),
        color: newTagColor,
        createdAt: new Date().toISOString(),
      });

      showToast("Tag created successfully", "success");
      setNewTagName("");
      closeModal();
    } catch (error) {
      console.error("Failed to create tag:", error);
      showToast("Failed to create tag. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!onDeleteTag || !deletingTagId) return;

    try {
      await onDeleteTag(deletingTagId);
      showToast("Tag deleted successfully", "success");
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      showToast("Failed to delete tag. Please try again.", "error");
    } finally {
      setDeletingTagId(null);
    }
  };

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colorOptions.length);
    setNewTagColor(colorOptions[randomIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Add Tag Button */}
      <div className="flex justify-center">
        <button
          onClick={openModal}
          className="btn btn-primary btn-sm gap-2 w-full md:w-auto px-6"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Tag</span>
        </button>
      </div>

      {/* Tag Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          <span>Your Tags</span>
          <span className="ml-1 text-xs text-base-content text-opacity-60">
            ({tags.length})
          </span>
        </h3>

        {tags.length === 0 ? (
          <div className="bg-base-200 rounded-lg p-4 text-center">
            <p className="text-sm text-base-content text-opacity-60">
              No tags created yet. Create your first tag to organize your notes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto p-1">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between bg-base-100 border border-base-200 rounded-lg p-3 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="font-medium">{tag.name}</span>
                </div>

                {onDeleteTag && (
                  <button
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={() => openDeleteModal(tag.id)}
                    aria-label={`Delete ${tag.name} tag`}
                  >
                    <Trash2 className="h-4 w-4 text-error" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-4">Create New Tag</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Tag Name</span>
              </label>
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Enter tag name..."
                  className={`input input-bordered w-full pr-8 ${
                    formError ? "input-error" : ""
                  }`}
                  disabled={isSubmitting}
                  maxLength={20}
                />
                {newTagName && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setNewTagName("")}
                  >
                    <X className="h-4 w-4 text-base-content text-opacity-60" />
                  </button>
                )}
              </div>

              {formError && (
                <div className="text-sm text-error flex items-center gap-1.5 mt-1 px-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="text-xs text-right mt-1 text-base-content text-opacity-70">
                {newTagName.length}/20 characters
              </div>
            </div>

            <div className="form-control w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="label-text font-medium">Tag Color</label>
                <button
                  type="button"
                  onClick={getRandomColor}
                  className="btn btn-ghost btn-xs flex gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Random</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      newTagColor === color
                        ? "ring-2 ring-offset-2 ring-primary transform scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  >
                    {newTagColor === color && (
                      <Check className="h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: newTagColor }}
                ></div>
                <div className="text-sm">
                  <p>
                    Preview:{" "}
                    <span className="font-medium">
                      {newTagName || "Tag Name"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-action gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !newTagName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Tag</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>

      {/* Delete Tag Confirmation Modal */}
      {onDeleteTag && (
        <dialog ref={deleteModalRef} className="modal">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-error bg-opacity-10 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
              <h3 className="font-bold text-lg">Delete Tag?</h3>
            </div>

            <p className="py-2 text-base-content text-opacity-70">
              Are you sure you want to delete this tag? This action cannot be
              undone.
              {deletingTagId && tags.find((t) => t.id === deletingTagId) && (
                <span className="block mt-2 font-medium">
                  Tag: {tags.find((t) => t.id === deletingTagId)?.name}
                </span>
              )}
            </p>

            <div className="modal-action gap-2">
              <button className="btn btn-outline" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDeleteTag}>
                Delete Tag
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeDeleteModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
