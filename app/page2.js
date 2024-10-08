// app/page.js
"use client"; // Add this line to enable client-side rendering for this file

import React, { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';

const Home = () => {
  const [barcode, setBarcode] = useState(null);

  const handleScan = (text) => {
    setBarcode(text);
  };

  return (
    <div>
      <h1>Barcode Scanner</h1>
      <BarcodeScanner onScan={handleScan} />
      {barcode && <p>Scanned Barcode: {barcode}</p>}
    </div>
  );
};

export default Home;
