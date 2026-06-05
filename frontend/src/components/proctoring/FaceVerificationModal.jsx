import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { studentService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiCamera, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const FaceVerificationModal = ({ userDescriptor, onVerified, onCancel }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [isReRegistering, setIsReRegistering] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        startVideo();
      } catch (err) {
        console.error('Model loading error:', err);
        toast.error('Failed to load AI models for face verification.');
      }
    };
    loadModels();

    return () => {
      stopVideo();
    };
  }, []);

  const startVideo = () => {
    setIsScanning(true);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Camera error:', err);
        toast.error('Could not access camera. Please allow permissions.');
      });
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const reRegisterAndVerify = async () => {
    if (!videoRef.current || isVerifying) return;

    if (videoRef.current.readyState !== 4) {
      toast.error('Camera is still initializing. Please wait a moment.');
      return;
    }

    setIsVerifying(true);
    const toastId = toast.loading('Re-registering face & verifying...');

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Face analysis timed out. Please try again.')), 15000)
      );

      const detectionPromise = faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      const detection = await Promise.race([detectionPromise, timeoutPromise]);

      if (!detection) {
        toast.error('No face detected! Please look clearly at the camera.', { id: toastId });
        setIsVerifying(false);
        return;
      }

      // Save new face descriptor to backend
      const descriptorArray = Array.from(detection.descriptor);
      await studentService.updateFace({ face_descriptor: descriptorArray });

      toast.success('Face re-registered & verified! Starting exam...', { id: toastId });
      stopVideo();
      onVerified();

    } catch (err) {
      console.error('Re-registration error:', err);
      toast.error(err.message || 'Re-registration failed.', { id: toastId });
      setIsVerifying(false);
    }
  };

  const verifyFace = async () => {
    if (!videoRef.current || isVerifying) return;
    
    // Check video readyState
    if (videoRef.current.readyState !== 4) {
      toast.error('Camera is still initializing. Please wait a moment.');
      return;
    }

    setIsVerifying(true);
    
    const toastId = toast.loading('Verifying identity...');
    
    try {
      // Add timeout to prevent indefinite hang
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Face verification timed out. Please try again.')), 15000)
      );

      const detectionPromise = faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      const detection = await Promise.race([detectionPromise, timeoutPromise]);

      if (!detection) {
        toast.error('No face detected. Look at the camera clearly.', { id: toastId });
        setIsVerifying(false);
        return;
      }

      // Reconstruct the Float32Array from the stored JSON array
      let storedArray;
      if (typeof userDescriptor === 'string') {
          storedArray = JSON.parse(userDescriptor);
      } else {
          storedArray = userDescriptor;
      }

      // Check if stored descriptor is valid
      if (!storedArray || !Array.isArray(storedArray) || storedArray.length !== 128) {
        console.warn('Invalid stored descriptor, allowing re-registration');
        setFailCount(2); // Force re-register option to show
        toast.error('Stored face data is invalid. Please re-register your face.', { id: toastId });
        setIsVerifying(false);
        return;
      }
      
      const storedDescriptor = new Float32Array(storedArray);

      // Compare using Euclidean distance
      const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);
      console.log('Face verification distance:', distance);
      
      // distance < 0.7 is a reasonable match threshold
      if (distance < 0.7) {
        toast.success('Identity Verified! You may start the exam.', { id: toastId });
        stopVideo();
        onVerified();
      } else {
        const newFailCount = failCount + 1;
        setFailCount(newFailCount);
        if (newFailCount >= 2) {
          toast.error(`Verification failed (Distance: ${distance.toFixed(2)}). You can re-register your face below.`, { id: toastId });
        } else {
          toast.error(`Verification Failed. Face does not match. (Distance: ${distance.toFixed(2)}). Try again.`, { id: toastId });
        }
        setIsVerifying(false);
      }
      
    } catch (err) {
      console.error('Face verification error:', err);
      toast.error(err.message || 'Verification error occurred.', { id: toastId });
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center' }}>
        <div className="modal-header">
          <h3>Identity Verification Required</h3>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
            We need to verify your identity against your registered face profile before starting the exam timer.
          </p>

          {!modelsLoaded ? (
            <div style={{ padding: '40px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              Loading AI Models...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '100%', maxWidth: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '3px solid var(--primary)', background: '#000' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
              </div>
            </div>
          )}

          {failCount >= 2 && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,165,0,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,165,0,0.3)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--warning, orange)', margin: 0 }}>
                ⚠️ Multiple verification failures. Your stored face data may be outdated. Click "Re-register & Verify" to update your face profile and proceed.
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => { stopVideo(); onCancel(); }} disabled={isVerifying}>
            Cancel & Go Back
          </button>
          {failCount >= 2 ? (
            <button className="btn btn-primary" onClick={reRegisterAndVerify} disabled={!modelsLoaded || isVerifying} style={{ background: 'var(--warning, orange)' }}>
              <FiRefreshCw style={{ marginRight: '8px' }} /> Re-register & Verify
            </button>
          ) : (
            <button className="btn btn-primary" onClick={verifyFace} disabled={!modelsLoaded || isVerifying}>
              <FiCamera style={{ marginRight: '8px' }} /> Verify My Identity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationModal;
