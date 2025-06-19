import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPhotos, deletePhoto, updatePhotoDescription } from "../api/photos";
import { getClientRoles } from "../api/auth";

export default function PhotoList({ refreshTrigger }) {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newDescription, setNewDescription] = useState("");
  const isAdmin = getClientRoles().includes("admin");

  const fetchPhotos = async () => {
    try {
      const data = await getPhotos();
      if (Array.isArray(data)) {
        setPhotos(data);
      } else {
        console.error("Invalid backend answer: ", data);
        setPhotos([]);
      }
    } catch (err) {
      console.error("Error fetching photos: ", err);
      setPhotos([]);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await deletePhoto(filename);
      setPhotos((prev) => prev.filter((p) => p.filename !== filename));
      if (selectedPhoto === filename) setSelectedPhoto(null);
    } catch (err) {
      console.error("Failed to delete photo:", err);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [refreshTrigger]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-4 flex-wrap justify-center">
          {photos.map((photo, index) => (
            <div key={index} className="relative group flex flex-col items-center border p-2 rounded-lg">
              <img
                src={`/uploads/${photo.filename}`}
                alt={photo.filename}
                className="w-24 h-24 object-cover rounded cursor-pointer border hover:opacity-80"
                onClick={() => setSelectedPhoto(photo.filename)}
              />
              <p className="text-sm text-gray-700 mt-1">
                {photo.description || <i className="text-gray-400">Brak opisu</i>}
              </p>

              {editMode === photo.filename ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await updatePhotoDescription(photo.filename, newDescription);
                    setEditMode(null);
                    fetchPhotos();
                  }}
                  className="mt-1 flex gap-2"
                >
                  <input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="px-2 py-1 border rounded"
                    placeholder="New description"
                  />
                  <button type="submit" className="bg-green-500 text-white px-2 rounded">
                    Save
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setEditMode(photo.filename);
                    setNewDescription(photo.description || "");
                  }}
                  className="text-blue-600 text-sm underline mt-1"
                >
                  Edit description
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleDelete(photo.filename)}
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  title="Usuń zdjęcie"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-red-500"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <img
            src={`/uploads/${selectedPhoto}`}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
