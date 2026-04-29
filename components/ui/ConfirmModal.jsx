"use client";
export default function ConfirmModal({ title, description, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-700 mb-4">{description}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
