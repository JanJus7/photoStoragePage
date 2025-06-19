import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPhotos, deletePhoto } from "../api/photos";
import { getClientRoles } from "../api/auth";

export default function PhotoList({ refreshTrigger }) {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
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
        <div className="flex gap-2 w-max">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={`/uploads/${photo.filename}`}
                alt={photo.filename}
                className="w-16 h-16 object-cover rounded cursor-pointer border hover:opacity-80"
                onClick={() => setSelectedPhoto(photo.filename)}
              />
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
