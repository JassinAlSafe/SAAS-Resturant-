"use client";

import { useState, useEffect } from "react";
import { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FiAlertCircle } from "react-icons/fi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EntityNotes from "@/app/(protected)/notes/EntityNotes";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void;
  supplier?: Supplier;
}

export default function SupplierModal({
  isOpen,
  onClose,
  onSave,
  supplier,
}: SupplierModalProps) {
  // Form state
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or supplier changes
  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        // Edit mode - populate form with supplier data
        setName(supplier.name || "");
        setContactName(supplier.contactName || "");
        setEmail(supplier.email || "");
        setPhone(supplier.phone || "");
        setAddress(supplier.address || "");
        setNotes(supplier.notes || "");
      } else {
        // Add mode - reset form
        setName("");
        setContactName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setNotes("");
      }
      setErrors({});
    }
  }, [isOpen, supplier]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!name.trim()) {
      newErrors.name = "Supplier name is required";
    }

    // Email validation (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (if provided)
    if (phone && !/^[\d\s\-+()]+$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt"> = {
        name,
        contactName,
        email,
        phone,
        address,
        notes,
      };

      onSave(supplierData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        {supplier ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Supplier</DialogTitle>
                  <DialogDescription>
                    Update your supplier&apos;s information below.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* Supplier Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="required">
                      Supplier Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setName(e.target.value)
                      }
                      className={errors.name ? "border-red-500" : ""}
                      autoFocus
                    />
                    {errors.name && (
                      <div className="text-red-500 text-sm flex items-center gap-1">
                        <FiAlertCircle className="h-4 w-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Contact Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setContactName(e.target.value)
                      }
                    />
                  </div>

                  {/* Email & Phone (side by side) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmail(e.target.value)
                        }
                        className={errors.email ? "border-red-500" : ""}
                        placeholder="supplier@example.com"
                      />
                      {errors.email && (
                        <div className="text-red-500 text-sm flex items-center gap-1">
                          <FiAlertCircle className="h-4 w-4" />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPhone(e.target.value)
                        }
                        className={errors.phone ? "border-red-500" : ""}
                        placeholder="+1 (234) 567-8901"
                      />
                      {errors.phone && (
                        <div className="text-red-500 text-sm flex items-center gap-1">
                          <FiAlertCircle className="h-4 w-4" />
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setAddress(e.target.value)
                      }
                      rows={2}
                    />
                  </div>

                  {/* Notes */}
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNotes(e.target.value)
                      }
                      placeholder="Additional details about this supplier..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Supplier</Button>
                </DialogFooter>
              </form>
            </TabsContent>
            <TabsContent value="notes" className="py-4">
              <EntityNotes
                entityType="supplier"
                entityId={supplier.id}
                entityName={supplier.name}
              />
              <div className="flex justify-end mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new supplier.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Supplier Name */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="required">
                  Supplier Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  className={errors.name ? "border-red-500" : ""}
                  autoFocus
                />
                {errors.name && (
                  <div className="text-red-500 text-sm flex items-center gap-1">
                    <FiAlertCircle className="h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Contact Name */}
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setContactName(e.target.value)
                  }
                />
              </div>

              {/* Email & Phone (side by side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="supplier@example.com"
                  />
                  {errors.email && (
                    <div className="text-red-500 text-sm flex items-center gap-1">
                      <FiAlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPhone(e.target.value)
                    }
                    className={errors.phone ? "border-red-500" : ""}
                    placeholder="+1 (234) 567-8901"
                  />
                  {errors.phone && (
                    <div className="text-red-500 text-sm flex items-center gap-1">
                      <FiAlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setAddress(e.target.value)
                  }
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Additional details about this supplier..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Supplier</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
