import React, { useState, ChangeEvent, ReactElement, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../core/firebase";
import imageCompression from "browser-image-compression";
import "./profile-photo.scss";
import { UploadSvg } from "../../svg/Upload";

const ProfilePhoto = ({ uid, canEdit }: any): ReactElement => {
  const [image, setImage] = useState("");
  const [bump, setBump] = useState(0);
  const [showUpload, setShowUpload] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: any) => {
    if(!canEdit) {
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    setShowUpload(false);

    if (file) {
      const compressedFile = await imageCompression(file, options);
      const storageRef = ref(storage, `images/${uid}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          if (progress >= 100) {
            setTimeout(() => {
              setProgress(0);
            }, 2000);
            setTimeout(() => {
              setShowUpload(true);
            }, 5000);
          }
        },
        (error) => {
          console.error(error);
        },
        () => {
          setBump(bump + 1);
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImage(downloadURL);
          });
        }
      );
    }
  };

  useEffect(() => {
    const storageRef = ref(storage, `images/${uid}`);

    getDownloadURL(storageRef)
      .then((res) => {
        setImage(res);
      })
      .catch((e) => {
        setImage("/player.jpeg");
      });
  }, [uid]);
  return (
    <div className="profile-photo">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="fileInput"
      />
      {image && <img src={`${image}?bump=${bump}`} width="90%" />}
      {progress > 0 && (
        <svg
          id="profileProgress"
          version="1.1"
          width="32vw"
          preserveAspectRatio="meet"
          viewBox="0 0 80 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            id="bar"
            r="35"
            cx="40"
            cy="40"
            fill="transparent"
            strokeDasharray="219.91"
            strokeDashoffset={((100 - progress) * 219.91) / 100}
          ></circle>
        </svg>
      )}
      {canEdit && showUpload && (
        <label
          htmlFor="fileInput"
          style={{
            cursor: "pointer",
            position: "absolute",
            textAlign: "center",
            width: "30vw",
            height: "30vw",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <UploadSvg width="50" height="50" />
        </label>
      )}
      {/* {file && (
        <>
          <div style={{ margin: '10px 0' }}>
            <img src={URL.createObjectURL(file)} alt="selected" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
          <button onClick={uploadImage} style={{ padding: '10px 20px', background: '#28a745', color: 'white', borderRadius: '5px', cursor: 'pointer', border: 'none' }}>Upload Image</button>
        </>
      )} */}
    </div>
  );
};

export default ProfilePhoto;
