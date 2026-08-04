"use client";

import { useState } from "react";

export default function DeleteConfirm({
  formId,
  itemName,
  itemType = "item",
}: {
  formId: string;
  itemName?: string;
  itemType?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function openModal(e?: React.MouseEvent) {
    e?.preventDefault();
    setOpen(true);
  }

  async function confirmDelete() {
    try {
      setSubmitting(true);
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (!form) throw new Error('Form not found');
      // Programmatically submit the form which is wired to a Server Action
      form.requestSubmit();
    } catch (e) {
      console.error('delete confirm failed', e);
      setSubmitting(false);
      setOpen(false);
      alert('Failed to submit delete request. Check console for details.');
    }
  }

  return (
    <>
      <button type="button" onClick={openModal} className="btn btn-ghost text-red-600">
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold">Confirm delete</h3>
            <p className="mt-2 text-sm text-muted-foreground">Are you sure you want to delete the {itemType}{itemName ? ` "${itemName}"` : ''}? This action cannot be undone.</p>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="btn btn-outline">Cancel</button>
              <button onClick={confirmDelete} disabled={submitting} className="btn btn-danger">
                {submitting ? 'Deleting...' : `Delete ${itemType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
