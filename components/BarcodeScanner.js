// components/BarcodeScanner.js
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true); // Add state for scanning
  const [error, setError] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    const startScanning = async () => {
      setScanning(true); // Set scanning to true when starting
      try {
        const result = await codeReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            setScanning(false); // Set scanning to false on successful scan
            onScan(result.text);
          }
          if (error) {
            setScanning(true); // Keep scanning if there’s an error
            setError(error);
          }
        });
      } catch (err) {
        setScanning(false);
        setError(err);
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
      setScanning(false); // Stop scanning when component unmounts
    };
  }, [onScan]);

  return (
    <div style={{ position: 'relative' }}>
      {scanning && (
        <div className="overlay">
          <p>Scanning...</p>
        </div>
      )}
      {error && <p>Error: {error.message}</p>}
      <video ref={videoRef} style={{ width: '100%' }} />
      <style jsx>{`
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          font-weight: bold;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
