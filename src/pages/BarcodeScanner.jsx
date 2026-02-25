import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarcodeScanner as NativeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { logSecurity } from '../lib/logger';
import { useMeals } from '../context/MealContext';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2 } },
};

export default function BarcodeScannerPage() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [loadingCode, setLoadingCode] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [zoomRatio, setZoomRatio] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const { meals } = useMeals();

  const handleBarcodeDetected = useCallback(async (barcode) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setLoadingCode(barcode);
    setErrorStatus(null);
    
    if (Capacitor.isNativePlatform()) {
      await NativeScanner.stopScan();
      document.querySelector('body').classList.remove('barcode-scanner-active');
    }

    try {
      const { data, error } = await supabase.functions.invoke('scan-barcode', {
        body: { barcode }
      });
      
      if (error || !data?.product) {
        logSecurity('SCAN_EAN', 'WARN', { barcode, found: false });
        setErrorStatus("Product not found");
        setTimeout(() => {
          setIsProcessing(false);
          setErrorStatus(null);
          setLoadingCode(null);
          setIsScanning(true);
        }, 3000);
      } else {
        logSecurity('SCAN_EAN', 'INFO', { barcode, found: true });
        navigate('/barcode-result', { state: { productData: data.product } });
      }
    } catch (error) {
      console.error(error);
      setErrorStatus("Connection error");
      setTimeout(() => {
        setIsProcessing(false);
        setErrorStatus(null);
        setLoadingCode(null);
        setIsScanning(true);
      }, 3000);
    }
  }, [navigate, isProcessing]);


  useEffect(() => {
    if (!isScanning) return;

    let scanListener = null;
    let codeReader = null;
    let controls = null;

    const startScanning = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Prepare for transparent webview
          document.querySelector('body').classList.add('barcode-scanner-active');
          
          scanListener = await NativeScanner.addListener('barcodesScanned', (event) => {
            if (event.barcodes && event.barcodes.length > 0 && isScanning) {
              handleBarcodeDetected(event.barcodes[0].displayValue);
            }
          });

          await NativeScanner.startScan({
            formats: [
              BarcodeFormat.Ean13, 
              BarcodeFormat.Ean8, 
              BarcodeFormat.UpcA, 
              BarcodeFormat.UpcE,
              BarcodeFormat.Code128,
              BarcodeFormat.QrCode
            ]
          });
        } catch (err) {
          console.error("Native scanning error:", err);
          document.querySelector('body').classList.remove('barcode-scanner-active');
        }
      } else {
        // Web Fallback
        try {
          codeReader = new BrowserMultiFormatReader();
          controls = await codeReader.decodeFromConstraints(
            { video: { facingMode: 'environment' } },
            videoRef.current,
            (result) => {
              if (result && isScanning) {
                handleBarcodeDetected(result.getText());
              }
            }
          );
        } catch (err) {
          console.error("Web scanning error:", err);
        }
      }
    };

    startScanning();

    return () => {
      if (Capacitor.isNativePlatform()) {
        if (scanListener) {
          scanListener.remove();
        }
        NativeScanner.stopScan();
        document.querySelector('body').classList.remove('barcode-scanner-active');
      } else {
        if (controls) {
          controls.stop();
        }
      }
    };
  }, [isScanning, handleBarcodeDetected]);




  const handleToggleFlash = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await NativeScanner.toggleTorch();
        const { enabled } = await NativeScanner.isTorchEnabled();
        setIsFlashOn(enabled);
      } catch (err) {
        console.error("Flash toggle error:", err);
      }
    }
  };

  const handleToggleZoom = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const nextZoom = zoomRatio === 1 ? 5 : 1;
        await NativeScanner.setZoomRatio({ zoomRatio: nextZoom });
        setZoomRatio(nextZoom);
      } catch (err) {
        console.error("Zoom error:", err);
      }
    } else {
      // Simulate on web
      setZoomRatio(prev => prev === 1 ? 5 : 1);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const code = manualBarcode.trim();
    if (!code) return;
    setManualMode(false);
    setManualBarcode('');
    await handleBarcodeDetected(code);
  };

  return (
    <motion.div 
      className="bg-background-dark text-slate-100 font-display antialiased selection:bg-primary selection:text-surface-dark overflow-hidden h-screen w-full relative flex items-center justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between">
        
        {Capacitor.isNativePlatform() ? (
          <div 
            className="absolute inset-0 z-0 bg-transparent transition-transform duration-300" 
            style={{ transform: zoomRatio > 1 ? `scale(${zoomRatio})` : 'scale(1)' }}
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0 scanner-video transition-transform duration-300" 
            style={{ transform: zoomRatio > 1 ? `scale(${zoomRatio})` : 'scale(1)' }}
          />
        )}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-background-dark/30"></div>
        </div>

        {/* Processing/Loading UI */}
        {(isProcessing || errorStatus) && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-8 backdrop-blur-md">
            {errorStatus ? (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/50">
                  <span className="material-symbols-rounded text-red-500" style={{ fontSize: 32 }}>error</span>
                </div>
                <p className="text-white font-bold text-xl mb-2">{errorStatus}</p>
                <p className="text-white/60 text-sm">Resuming scanner in a few seconds...</p>
              </>
            ) : (
              <>
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-rounded text-primary animate-pulse" style={{ fontSize: 32 }}>search</span>
                  </div>
                </div>
                <p className="text-white font-bold text-xl mb-2">Analyzing Product</p>
                <p className="text-primary/80 font-mono tracking-widest">{loadingCode}</p>
                <p className="text-white/40 text-xs mt-8">Consulting OpenFoodFacts database...</p>
              </>
            )}
          </div>
        )}

        {/* Manual Entry Modal */}
        {manualMode && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm" onClick={() => setManualMode(false)}>
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleManualSubmit}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4"
            >
              <h3 className="text-white font-bold text-lg text-center">Enter Barcode</h3>
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                placeholder="ex: 3017620422003"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl disabled:opacity-40 transition-opacity"
              >
                Search Product
              </button>
              <button type="button" onClick={() => setManualMode(false)} className="text-white/40 text-sm text-center">
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Top Bar */}
        <div className="relative z-10 flex flex-col w-full bg-gradient-to-b from-black/60 to-transparent pt-12 pb-6 px-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>arrow_back</span>
            </button>
            <h2 className="text-white text-lg font-bold tracking-tight">Scan Product</h2>
            <div className="size-10" />
          </div>
          {/* Auto-focus Indicator */}
          <div className="flex justify-center mt-4">
            <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <span className="material-symbols-rounded text-primary animate-pulse" style={{ fontSize: '14px' }}>center_focus_strong</span>
              <span className="text-xs font-medium text-white/90">Auto-focus active</span>
            </div>
          </div>
        </div>

        {/* Center Scanner Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative w-72 h-72 border-2 border-primary/30 rounded-3xl shadow-glow overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
            {/* Scanning Laser Line */}
            {/* Helper Text inside frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!loadingCode && <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest text-center px-4">Scanner ready</span>}
            </div>
          </div>
          <button
            onClick={() => setManualMode(true)}
            className="mt-8 text-white/80 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>keyboard</span>
            Enter barcode manually
          </button>
        </div>

        {/* Bottom Area */}
        <div className="relative z-10 w-full px-6 pb-12 pt-4 flex flex-col gap-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between px-4 z-50 relative max-w-sm mx-auto w-full">
            <button onClick={handleToggleFlash} className="flex flex-col items-center gap-2 group cursor-pointer z-50">
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all active:scale-90">
                <span className={`material-symbols-rounded ${isFlashOn ? 'text-primary' : 'text-white/80'} group-hover:text-primary`} style={{ fontSize: '28px' }}>
                  {isFlashOn ? 'flash_on' : 'flash_off'}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-primary transition-colors">Flash</span>
            </button>
            
            <button 
              onClick={handleToggleZoom}
              className="relative group active:scale-95 transition-transform"
            >
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg transform group-active:scale-90 transition-all">
                  <span className="text-zinc-900 font-black text-xl tracking-tighter">{zoomRatio}x</span>
                </div>
              </div>
            </button>

            <button onClick={() => setHistoryOpen(true)} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all active:scale-90">
                <span className="material-symbols-rounded text-white/80 group-hover:text-primary" style={{ fontSize: '28px' }}>history</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-primary transition-colors">History</span>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center gap-8 text-white/50 text-xs font-bold uppercase tracking-widest pb-4">
            <span className="text-white relative">
              Barcode
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
            </span>
            <Link to="/scanner" className="hover:text-white transition-colors">Meal</Link>
            <span className="hover:text-white transition-colors cursor-pointer">Recipe</span>
          </div>
        </div>

      </div>

      {/* History Slide-Up Panel */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            className="absolute inset-0 z-[60] flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setHistoryOpen(false)} />
            {/* Panel */}
            <motion.div
              className="relative bg-zinc-900 border-t border-white/10 rounded-t-3xl flex flex-col max-h-[70vh]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Handle + Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />
                <h3 className="text-white font-bold text-base">Scan History</h3>
                <button onClick={() => setHistoryOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <span className="material-symbols-rounded" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>
              {/* Meals List */}
              <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-3">
                {meals.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
                    <span className="material-symbols-rounded text-5xl">qr_code_scanner</span>
                    <p className="text-sm">Aucun scan enregistré</p>
                  </div>
                ) : (
                  meals.map(meal => (
                    <button
                      key={meal.id}
                      onClick={() => { setHistoryOpen(false); navigate('/barcode-result', { state: { productData: meal } }); }}
                      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 w-full text-left hover:bg-white/10 transition-colors"
                    >
                      {meal.image_url ? (
                        <img src={meal.image_url} alt={meal.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-rounded text-white/30" style={{ fontSize: 24 }}>restaurant</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{meal.name}</p>
                        <p className="text-slate-400 text-xs">{meal.calories} kcal · P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g</p>
                      </div>
                      <span className="material-symbols-rounded text-white/20" style={{ fontSize: 18 }}>chevron_right</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
