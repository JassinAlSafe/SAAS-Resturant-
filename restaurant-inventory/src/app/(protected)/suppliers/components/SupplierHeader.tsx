"use client";

interface SupplierHeaderProps {
  error?: string;
  retry?: () => void;
}

export default function SupplierHeader({ error, retry }: SupplierHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Suppliers</h1>
      <p className="text-sm text-muted-foreground">
        Manage your suppliers and vendor contacts
      </p>
    </div>
  );
}
