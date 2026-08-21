// src/components/common/ModalWrapper.jsx
import React from "react";

export default function ModalWrapper({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Background */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/70" onClick={onClose} />

      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-lg z-10 w-11/12 max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
