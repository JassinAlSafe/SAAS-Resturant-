"use client";

import { useState, useRef } from "react";
import { NoteTag } from "@/lib/types";
import { Tag, Plus, X, Check } from "lucide-react";

interface TagManagerProps {
  tags: NoteTag[];
  onAddTag: (tag: Omit<NoteTag, "id">) => Promise<void>;
  onDeleteTag?: (id: string) => Promise<void>;
  onUpdateTag?: (
    id: string,
    tag: Partial<Omit<NoteTag, "id">>
  ) => Promise<void>;
}

export default function TagManager({
  tags,
  onAddTag,
  onDeleteTag,
  onUpdateTag,
}: TagManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

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
    setIsModalOpen(true);
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    modalRef.current?.close();
    setNewTagName("");
  };

  const showToast = (message: string, type: "success" | "error") => {
    const toast = document.getElementById("toast-container");
    if (toast) {
      const alertClass = type === "success" ? "alert-success" : "alert-error";
      const alertDiv = document.createElement("div");
      alertDiv.className = `alert ${alertClass}`;
      alertDiv.innerHTML = `<span>${message}</span>`;

      toast.appendChild(alertDiv);
      toast.classList.add("opacity-100");

      setTimeout(() => {
        alertDiv.classList.add("opacity-0");
        setTimeout(() => alertDiv.remove(), 300);
        if (toast.childElementCount <= 1) {
          toast.classList.remove("opacity-100");
        }
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTagName.trim()) {
      showToast("Tag name cannot be empty", "error");
      return;
    }

    if (
      tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())
    ) {
      showToast("A tag with this name already exists", "error");
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
      closeModal();
    } catch (error) {
      console.error("Failed to create tag:", error);
      showToast("Failed to create tag. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!onDeleteTag) return;

    try {
      await onDeleteTag(id);
      showToast("Tag deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete tag:", error);
      showToast("Failed to delete tag", "error");
    }
  };

  return (
    <div>
      {/* Toast container */}
      <div
        id="toast-container"
        className="toast toast-top toast-end z-50 transition-opacity duration-300 opacity-0"
      ></div>

      {/* Add Tag Button */}
      <button onClick={openModal} className="btn btn-outline btn-sm gap-2">
        <Plus className="h-4 w-4" />
        <span>Add Tag</span>
      </button>

      {/* Modal Dialog */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Tag</h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Tag Name</span>
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                className="input input-bordered w-full"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Tag Color</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      newTagColor === color
                        ? "ring-2 ring-offset-2 ring-primary"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  >
                    {newTagColor === color && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline"
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
                {isSubmitting ? "Creating..." : "Create Tag"}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          <span>Existing Tags</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <p className="text-sm text-base-content text-opacity-60">
              No tags created yet
            </p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="badge gap-1 text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                {onDeleteTag && (
                  <button
                    className="ml-1 hover:opacity-80"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
