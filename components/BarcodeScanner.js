// components/BarcodeScanner.js
"use client"; // Add this line

import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    const startScanning = async () => {
      try {
        const result = await codeReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            alert(result.text);
            onScan(result.text); // Call the callback with the scanned text
          }
          if (error) {
            setError(error);
          }
        });
      } catch (err) {
        setError(err);
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
    };
  }, [onScan]);

  return (
    <div>
      {error && <p>Error: {error.message}</p>}
      <video ref={videoRef} style={{ width: '100%' }} />
    </div>
  );
};

export default BarcodeScanner;
