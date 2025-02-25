import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ImageUploadModal = ({ isOpen, onClose, eventId, onImageUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const storage = getStorage();
    const imageRef = ref(storage, `event-images/${eventId}`);

    try {
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);

      // Update Firestore with the new image URL
      await updateDoc(doc(db, 'events', eventId), {
        imageUrl: imageUrl
      });

      onImageUploaded(); // Callback to refresh the event list
      alert("Image uploaded successfully.");
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-gray-800 rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Upload Image</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button onClick={onClose} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageUploadModal;