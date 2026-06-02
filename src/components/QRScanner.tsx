'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
  fps?: number;
  qrbox?: number;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanFailure,
  fps = 10,
  qrbox = 250
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    setErrorMsg('');
    if (!scannerRef.current) return;
    
    try {
      await scannerRef.current.start(
        { facingMode: "environment" }, // Prefer back camera for mobile
        {
          fps: fps,
          qrbox: { width: qrbox, height: qrbox },
          aspectRatio: 1.0
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanFailure) onScanFailure(errorMessage);
        }
      );
      setIsStarted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to access camera. Please allow permissions.');
      setIsStarted(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setIsStarted(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div 
        id="qr-reader" 
        className={`w-full overflow-hidden rounded-[2rem] border-4 ${isStarted ? 'border-emerald-500 shadow-xl shadow-emerald-500/20' : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900'} relative`}
        style={{ minHeight: isStarted ? '300px' : '0' }}
      ></div>

      {!isStarted && (
        <div className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 text-center mt-4">
          <Camera size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to Scan</h3>
          <p className="text-sm text-gray-500 mb-6">Point your camera at a participant's Cluvion QR code to mark attendance.</p>
          <button 
            onClick={startScanner}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
          >
            Start Camera
          </button>
          {errorMsg && <p className="text-rose-500 text-sm mt-3 font-medium">{errorMsg}</p>}
        </div>
      )}

      {isStarted && (
        <button 
          onClick={stopScanner}
          className="mt-6 py-3 px-8 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all"
        >
          Stop Camera
        </button>
      )}
    </div>
  );
};

export default QRScanner;
