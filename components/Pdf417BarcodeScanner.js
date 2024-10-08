import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

const Pdf417BarcodeScanner = () => {
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);
    codeReader.setHints(hints);

    codeReader.listVideoInputDevices().then((videoInputDevices) => {
      if (videoInputDevices.length > 0) {
        codeReader.decodeFromVideoDevice(
          videoInputDevices[0].deviceId,
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