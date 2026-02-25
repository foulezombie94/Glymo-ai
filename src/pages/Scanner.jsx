import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { logSecurity } from '../lib/logger';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2 } },
};

export default function Scanner() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [zoomRatio, setZoomRatio] = React.useState(1);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleToggleZoom = async () => {
    const nextZoom = zoomRatio === 1 ? 5 : 1;
    setZoomRatio(nextZoom);

    // Try to apply native zoom if supported
    if (videoRef.current && videoRef.current.srcObject) {
      const track = videoRef.current.srcObject.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = track.getCapabilities();
          if (capabilities.zoom) {
            await track.applyConstraints({
              advanced: [{ zoom: nextZoom }]
            });
          }
        } catch (err) {
          console.error("Native zoom not supported:", err);
        }
      }
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      const { data, error } = await supabase.functions.invoke('identify-meal', {
        body: { image: base64Image }
      });
      
      if (error || !data?.product) {
        throw new Error(error?.message || "Failed to identify meal");
      }
      
      logSecurity('MEAL_SCAN', 'INFO', { meal_name: data.product.name });
      navigate('/results', { state: { mealData: { ...data.product, image_url: canvas.toDataURL('image/jpeg', 0.8) } } });
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGalleryClick = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      if (image.base64String) {
        setIsAnalyzing(true);
        try {
          const { data, error } = await supabase.functions.invoke('identify-meal', {
            body: { image: image.base64String }
          });
          
          if (error || !data?.product) {
            throw new Error(error?.message || "Produit non reconnu");
          }
          
          logSecurity('MEAL_SCAN', 'INFO', { meal_name: data.product.name });
          navigate('/results', { state: { mealData: { ...data.product, image_url: `data:image/jpeg;base64,${image.base64String}` } } });
        } catch (err) {
          console.error("Gallery scan error:", err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err) {
      console.error("Gallery error:", err);
    }
  };
  return (
    <motion.div 
      className="text-slate-900 dark:text-slate-100 antialiased h-full font-display bg-black overflow-hidden flex justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
        
        {/* Status Bar / Safe Area Top */}
        <div className="absolute top-0 w-full z-50 px-8 flex justify-between items-center text-white"
             style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(2.5rem + env(safe-area-inset-top))' }}>
          <span className="text-sm font-semibold">9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="material-icons-round text-sm">signal_cellular_alt</span>
            <span className="material-icons-round text-sm">wifi</span>
            <span className="material-icons-round text-sm">battery_full</span>
          </div>
        </div>

        {/* Camera View */}
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover opacity-80 scanner-video transition-transform duration-300" 
            style={{ transform: zoomRatio > 1 ? `scale(${zoomRatio})` : 'scale(1)' }}
          />
          <div className="absolute inset-0 camera-overlay"></div>
          
          {/* Scanning Animation Line */}
          <div className="absolute w-full scan-line z-10"></div>
          
          {/* AR Tags */}
          <div className="absolute top-[35%] left-[20%] z-20 animate-bounce transition-all duration-1000" style={{ animationDuration: '3s' }}>
            <div className="glass-tag bg-green-500/20 text-white rounded-2xl p-3 shadow-xl flex flex-col items-start gap-1 transform -rotate-3">
              <div className="flex items-center gap-2">
                <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">Avocado</span>
              </div>
              <span className="text-xl font-bold">160 <span className="text-xs font-normal">kcal</span></span>
              <div className="text-[10px] opacity-70">Estimated 80g</div>
            </div>
          </div>
          
          <div className="absolute top-[48%] right-[15%] z-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
            <div className="glass-tag bg-yellow-500/20 text-white rounded-2xl p-3 shadow-xl flex flex-col items-start gap-1 transform rotate-6">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 w-2 h-2 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">Poached Egg</span>
              </div>
              <span className="text-xl font-bold">72 <span className="text-xs font-normal">kcal</span></span>
              <div className="text-[10px] opacity-70">Large (50g)</div>
            </div>
          </div>
          
          <div className="absolute bottom-[40%] left-[40%] z-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
            <div className="glass-tag bg-orange-500/20 text-white rounded-2xl p-3 shadow-xl flex flex-col items-start gap-1 transform -rotate-1">
              <div className="flex items-center gap-2">
                <span className="bg-orange-400 w-2 h-2 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">Sourdough</span>
              </div>
              <span className="text-xl font-bold">110 <span className="text-xs font-normal">kcal</span></span>
              <div className="text-[10px] opacity-70">1 thick slice</div>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute left-0 w-full flex justify-between items-center px-6 z-30"
             style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}>
          <Link to="/" className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
            <span className="material-icons-round">chevron_left</span>
          </Link>
          <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="material-icons-round text-primary-scan text-sm">auto_awesome</span>
            <span className="text-white text-xs font-semibold uppercase tracking-widest">AI Scanning</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
            <span className="material-icons-round text-sm">flash_on</span>
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 w-full z-40 px-6 pt-8 flex flex-col gap-8"
             style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}>
          {/* Total Bar / Zoom Bar */}
          <div className="flex flex-col items-center gap-4">
            {/* Zoom Toggle Pill */}
            <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
              <button 
                onClick={() => zoomRatio !== 1 && handleToggleZoom()}
                className={`px-4 py-1 rounded-full text-[10px] font-black transition-all ${zoomRatio === 1 ? 'bg-white text-zinc-900' : 'text-white/60'}`}
              >
                1X
              </button>
              <button 
                onClick={() => zoomRatio !== 5 && handleToggleZoom()}
                className={`px-4 py-1 rounded-full text-[10px] font-black transition-all ${zoomRatio === 5 ? 'bg-white text-zinc-900' : 'text-white/60'}`}
              >
                5X
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Total Estimated</span>
                <span className="text-white font-bold text-lg">342 <span className="text-sm font-medium">kcal</span></span>
              </div>
              <div className="h-8 w-[1px] bg-white/20"></div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">P</div>
                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-yellow-500 flex items-center justify-center text-[10px] text-white font-bold">F</div>
                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">C</div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between px-4 z-50 relative max-w-sm mx-auto w-full">
            <button onClick={handleGalleryClick} className="flex flex-col items-center gap-2 group cursor-pointer z-50">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all active:scale-90">
                <span className="material-icons-round text-white/80" style={{ fontSize: '28px' }}>photo_library</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">Gallery</span>
            </button>
            
            <div className="relative flex items-center justify-center">
              <button 
                onClick={handleCapture}
                disabled={isAnalyzing}
                className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center backdrop-blur-sm disabled:opacity-50"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all cursor-pointer">
                  {isAnalyzing ? (
                    <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-zinc-200"></div>
                  )}
                </div>
              </button>
            </div>
            
            <button className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all active:scale-90">
                <span className="material-icons-round text-white/80" style={{ fontSize: '28px' }}>history</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">History</span>
            </button>
          </div>
          
          {/* Mode Selector */}
          <div className="flex justify-center gap-8 text-white/50 text-xs font-bold uppercase tracking-widest">
            <Link to="/barcode-scanner" className="hover:text-white transition-colors cursor-pointer">Barcode</Link>
            <span className="text-white relative">
              Meal
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
            </span>
            <span>Recipe</span>
          </div>
        </div>
        
        {/* Decorative Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full z-50 pointer-events-none"></div>
      </div>
    </motion.div>
  );
}
