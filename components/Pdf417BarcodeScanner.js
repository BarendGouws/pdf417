import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, NotFoundException } from '@zxing/library';

const Pdf417BarcodeScanner = () => {
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    codeReader.listVideoInputDevices().then((videoInputDevices) => {
      if (videoInputDevices.length > 0) {
        // Try to use the back camera if available
        const backCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back'));
        const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              setResult(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              console.error(err);
            }
          }
        );
      }
    }).catch((err) => console.error(err));

    return () => {
      codeReader.reset();
    };
  }, []);

  return (
    <div>
      <h2>PDF417 Barcode Scanner</h2>
      <video ref={videoRef} style={{ width: '100%' }} />
      {result && (
        <div>
          <h3>Scanned Result:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default Pdf417BarcodeScanner;