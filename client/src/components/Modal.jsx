const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-black hover:text-gray-900 dark:hover:text-black"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
