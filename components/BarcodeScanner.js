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
      <video ref={videoRef} style={{ width: '100%' }} />
      <div className="scanner-overlay">
        <div className="scanner-guide"></div>
        {scanning && (
          <div className="overlay">
            <p>Scanning...</p>
          </div>
        )}
      </div>
      {error && <p>Error: {error.message}</p>}
      <style jsx>{`
        .scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .scanner-guide {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80%;
          height: 20%;
          border: 2px dashed #ff0000;
          transform: translate(-50%, -50%);
          box-sizing: border-box;
          z-index: 10;
        }
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
          z-index: 20;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
