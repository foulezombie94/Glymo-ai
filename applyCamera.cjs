const fs = require('fs');

function applyCamera(path, isBarcode) {
  let code = fs.readFileSync(path, 'utf8');

  // 1. Imports
  if (!code.includes('useRef')) {
    code = code.replace(/import React from 'react';/, "import React, { useRef, useEffect } from 'react';");
  }

  const componentName = isBarcode ? 'BarcodeScanner' : 'Scanner';

  // 2. Component body start (adding hooks and handlers)
  if (!code.includes('const videoRef = useRef')) {
    const hooksTemplate = `export default function ${componentName}() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app we'd process the file, here we mock navigation
      if(window.location.pathname === '/barcode-scanner') {
        window.location.href = '/barcode-result';
      } else {
        window.location.href = '/results';
      }
    }
  };
`;
    // Find the export default and replace it with the hooks template
    code = code.replace(new RegExp(`export default function ${componentName}\\(\\) \\{`), hooksTemplate);
  }

  // 3. Add hidden input and replace image/bg
  if (isBarcode) {
    if (code.includes('backgroundImage')) {
      code = code.replace(
        /<div\s*className="absolute inset-[^>]*?bg-cover bg-center"[^>]*?style={{ backgroundImage: [^>]*?}}>\s*<div className="absolute inset-0 bg-background-dark\/30"><\/div>\s*<\/div>/,
        `<video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover z-0"></video>
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        <div className="absolute inset-0 bg-background-dark/30 z-0 pointer-events-none"></div>`
      );
    }
  } else {
    if (code.includes('<img \n            alt="Avocado Toast on a plate"')) {
      code = code.replace(
        /<img \n            alt="Avocado Toast on a plate"[^>]*?>/,
        `<video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80"></video>
         <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />`
      );
    }
  }

  // 4. Update Gallery button
  if (isBarcode) {
    code = code.replace(
      /<button className="flex flex-col items-center gap-1 group">\s*<div className="w-12 h-12 rounded-full bg-black\/40[^>]*?>\s*<span className="material-symbols-rounded[^>]*?>photo_library<\/span>\s*<\/div>\s*<span className="text-xs[^>]*?>Gallery<\/span>\s*<\/button>/,
      `<button onClick={handleGalleryClick} className="flex flex-col items-center gap-1 group z-50">
         <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
           <span className="material-symbols-rounded text-white/80 group-hover:text-primary" style={{ fontSize: '24px' }}>photo_library</span>
         </div>
         <span className="text-xs font-medium text-white/60">Gallery</span>
       </button>`
    );
  } else {
    code = code.replace(
      /<button className="w-12 h-12 rounded-2xl bg-white\/10 backdrop-blur-md flex items-center justify-center text-white">\s*<span className="material-icons-round">photo_library<\/span>\s*<\/button>/,
      `<button onClick={handleGalleryClick} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white z-50">
         <span className="material-icons-round">photo_library</span>
       </button>`
    );
  }

  fs.writeFileSync(path, code);
}

applyCamera('src/pages/Scanner.jsx', false);
applyCamera('src/pages/BarcodeScanner.jsx', true);
console.log('Done');
