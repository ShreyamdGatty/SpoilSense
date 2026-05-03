import React, { useState, useRef, useEffect } from 'react';
import { PackageCheck, Leaf, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FoodPage.css';

export default function FoodPage() {
  const [responseMsg, setResponseMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('Camera access denied or not available.');
      console.error(err);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
        setPreviewURL(URL.createObjectURL(blob));
        uploadImage(file);
        setShowCamera(false);
      }
    }, 'image/jpeg');
  };

  const uploadImage = async (file) => {
    if (!file || !selectedType) {
      alert('Please select a food type before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('food_type', selectedType);

    setLoading(true);
    setResponseMsg('');

    try {
      const res = await fetch('http://localhost:5000/process-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        let message = '';

        if (selectedType === 'non-packed') {
          const freshness = data.freshness;
          const predictedClass = data.predicted_class;
          const confidence = (data.confidence * 100).toFixed(2);

          if (freshness === 'fresh') {
            message = `✅ It's FRESH! 🥦 (${predictedClass}) - Confidence: ${confidence}%`;
          } else {
            message = `⚠️ Looks ROTTEN! 🤢 (${predictedClass}) - Confidence: ${confidence}%`;
          }
        } else {
          message = data.message;
        }

        setResponseMsg(message);
        alert(message);

        navigate('/result', {
          state: {
            message,
            foodType: selectedType,
          },
        });
      } else {
        const errorMsg = data.message || 'Something went wrong';
        alert('Error: ' + errorMsg);
        setResponseMsg('❌ ' + errorMsg);
      }
    } catch (err) {
      setLoading(false);
      console.error('Upload Error:', err);
      alert('Error uploading image');
      setResponseMsg('❌ Error uploading image');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedType) {
      alert('Please select a food type before uploading.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    setPreviewURL(URL.createObjectURL(file));
    uploadImage(file);
  };

  const triggerInput = (type) => {
    setSelectedType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openCamera = (type) => {
    setSelectedType(type);
    setShowCamera(true);
  };

  return (
    <div className="food-page">
      <h2>Choose Food Type</h2>

      <div className="food-options">
        <div
          className={`food-card packed ${selectedType === 'packed' ? 'active' : ''}`}
          onClick={() => setSelectedType('packed')}
        >
          <PackageCheck size={32} />
          <h3>Packed Food</h3>
          <button onClick={() => openCamera('packed')}>Capture Image</button>
          <button onClick={() => triggerInput('packed')}>Upload Image</button>
        </div>

        <div
          className={`food-card non-packed ${selectedType === 'non-packed' ? 'active' : ''}`}
          onClick={() => setSelectedType('non-packed')}
        >
          <Leaf size={32} />
          <h3>Non-Packed Food</h3>
          <button onClick={() => openCamera('non-packed')}>Capture Image</button>
          <button onClick={() => triggerInput('non-packed')}>Upload Image</button>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {showCamera && (
        <div className="camera-container">
          <video ref={videoRef} autoPlay playsInline muted></video>
          <button className="capture-btn" onClick={capturePhoto}>
            <Camera size={20} /> Capture
          </button>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}

      {loading && (
        <div className="loading-circle">
          <p>Processing...</p>
        </div>
      )}

      {previewURL && (
        <div className="image-preview">
          <p>Selected Image Preview:</p>
          <img src={previewURL} alt="Preview" width="200" />
        </div>
      )}

      {responseMsg && (
        <div className="response-msg">
          <p>{responseMsg}</p>
          <button onClick={() => setResponseMsg('')}>Clear</button>
        </div>
      )}
    </div>
  );
}
