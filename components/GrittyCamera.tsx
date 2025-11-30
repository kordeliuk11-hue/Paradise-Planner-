import React, { useRef, useState, useEffect } from 'react';
import { Camera, Save, X } from 'lucide-react';
import { GrittyButton } from './DirtyUI';

const GrittyCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      setError("Доступ к камере запрещен. Ты разбил объектив?");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video
      ctx.drawImage(video, 0, 0);
      
      // Apply "Dirty" filters manually to canvas data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple noise + high contrast + sepia implementation
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Sepia
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;

        // Contrast boost
        const factor = 1.5; // High contrast
        r = factor * (tr - 128) + 128;
        g = factor * (tg - 128) + 128;
        b = factor * (tb - 128) + 128;

        // Noise
        const noise = (Math.random() - 0.5) * 60;
        
        data[i] = Math.min(255, Math.max(0, r + noise));
        data[i + 1] = Math.min(255, Math.max(0, g + noise));
        data[i + 2] = Math.min(255, Math.max(0, b + noise));
      }
      
      ctx.putImageData(imageData, 0, 0);

      // Add "Date Stamp" style overlay
      ctx.font = 'bold 40px "Courier New", monospace';
      ctx.fillStyle = '#ff9900';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(new Date().toLocaleString('ru-RU'), 20, canvas.height - 20);

      setPhoto(canvas.toDataURL('image/jpeg'));
    }
  };

  const downloadPhoto = () => {
    if (photo) {
      const link = document.createElement('a');
      link.href = photo;
      link.download = `postal_evidence_${Date.now()}.jpg`;
      link.click();
    }
  };

  const clearPhoto = () => setPhoto(null);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <p className="text-red-500 font-dirty text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black p-4">
      <div className="flex-1 relative border-4 border-stone-600 overflow-hidden bg-stone-900">
        {!photo && (
          <>
             {/* The Video Element (hidden mostly by CSS filters visually but raw here) */}
             <video 
               ref={videoRef} 
               className="w-full h-full object-cover filter contrast-125 sepia brightness-75 grayscale-[0.3]"
               muted
               playsInline 
             />
             {/* Overlay UI */}
             <div className="absolute top-4 left-4 text-green-500 font-mono text-xs animate-pulse">
               REC ● [ {new Date().toLocaleTimeString('ru-RU')} ]
             </div>
             <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]"></div>
          </>
        )}
        
        {photo && (
          <img src={photo} alt="Captured" className="w-full h-full object-contain" />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="h-24 flex items-center justify-center gap-6 bg-stone-800 border-t-4 border-stone-600 p-4">
        {!photo ? (
          <button 
            onClick={takePhoto}
            className="w-16 h-16 rounded-full bg-red-600 border-4 border-stone-300 hover:bg-red-500 active:scale-95 transition-transform"
          />
        ) : (
          <>
            <GrittyButton onClick={clearPhoto} variant="neutral">
              <X className="w-6 h-6" />
            </GrittyButton>
            <GrittyButton onClick={downloadPhoto} variant="primary">
              <Save className="w-6 h-6" />
            </GrittyButton>
          </>
        )}
      </div>
    </div>
  );
};

export default GrittyCamera;