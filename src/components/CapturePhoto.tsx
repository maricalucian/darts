// CapturePhoto.tsx
import React, { useState, ChangeEvent } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../core/firebase";

const CapturePhoto: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadImage = () => {
    if (file) {
      const storageRef = ref(storage, `images/${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setUrl(downloadURL);
            console.log("File available at", downloadURL);
          });
        }
      );
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        // capture="environment"
        onChange={handleFileChange}
      />
      {file && (
        <>
          <img src={URL.createObjectURL(file)} alt="selected" />
          <button onClick={uploadImage}>Upload Image</button>
        </>
      )}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Uploaded Image
        </a>
      )}
    </div>
  );
};

export default CapturePhoto;
