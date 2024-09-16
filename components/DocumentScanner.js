// components/DocumentScanner.js
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import Script from 'next/script';

const DocumentScanner = () => {
    const webcamRef = useRef(null);
    const [scannedImage, setScannedImage] = useState(null);

    useEffect(() => {
        // Ensure OpenCV.js is loaded
        const onLoad = () => {
            console.log('OpenCV.js loaded');
        };

        // Add an event listener to confirm that OpenCV is ready
        if (typeof cv !== 'undefined') {
            onLoad();
        }
    }, []);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        processImage(imageSrc);
    };

    const processImage = (imageSrc) => {
        // Ensure OpenCV.js is loaded before processing the image
        if (typeof cv === 'undefined') {
            console.error('OpenCV.js is not loaded');
            return;
        }

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            // Create a canvas to draw the image for OpenCV processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Load the image into OpenCV
            const src = cv.imread(canvas);
            const dst = new cv.Mat();
            const gray = new cv.Mat();
            const edges = new cv.Mat();

            // Convert the image to grayscale
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

            // Use Canny Edge Detection to find the edges
            cv.Canny(gray, edges, 50, 150);

            // Find contours
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            // Find the largest contour, assuming it is the document
            let maxArea = 0;
            let bestContour = null;
            for (let i = 0; i < contours.size(); i++) {
                const contour = contours.get(i);
                const area = cv.contourArea(contour);
                if (area > maxArea) {
                    maxArea = area;
                    bestContour = contour;
                }
            }

            // Approximate the contour to a polygon and get the bounding box
            const approx = new cv.Mat();
            cv.approxPolyDP(bestContour, approx, 0.02 * cv.arcLength(bestContour, true), true);

            if (approx.rows === 4) {
                const points = [];
                for (let i = 0; i < 4; i++) {
                    points.push({
                        x: approx.data32S[i * 2],
                        y: approx.data32S[i * 2 + 1],
                    });
                }

                // Order the points and apply perspective transform
                points.sort((a, b) => a.y - b.y);
                const [topLeft, topRight] = points.slice(0, 2).sort((a, b) => a.x - b.x);
                const [bottomLeft, bottomRight] = points.slice(2).sort((a, b) => a.x - b.x);
                const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    topLeft.x, topLeft.y,
                    topRight.x, topRight.y,
                    bottomRight.x, bottomRight.y,
                    bottomLeft.x, bottomLeft.y
                ]);

                // Dimensions for the output image
                const width = src.size().width;
                const height = src.size().height;
                const dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    0, 0,
                    width, 0,
                    width, height,
                    0, height
                ]);

                const M = cv.getPerspectiveTransform(srcCoords, dstCoords);
                cv.warpPerspective(src, dst, M, new cv.Size(width, height));

                // Convert the result to base64 and set it as the scanned image
                cv.imshow(canvas, dst);
                const scannedImageSrc = canvas.toDataURL('image/jpeg');
                setScannedImage(scannedImageSrc);
            }

            // Clean up
            src.delete(); dst.delete(); gray.delete(); edges.delete();
            contours.delete(); hierarchy.delete(); approx.delete();
        };
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.addImage(scannedImage, 'JPEG', 10, 10, 180, 160);
        doc.save('scanned-document.pdf');
    };

    return (
        <div>
            <Script
                src="https://docs.opencv.org/4.x/opencv.js"
                onLoad={() => console.log('OpenCV.js loaded successfully')}
                strategy="beforeInteractive"
            />
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
            />
            <div>
                <button onClick={capture}>Capture Document</button>
                <button onClick={generatePDF} disabled={!scannedImage}>
                    Generate PDF
                </button>
            </div>
            {scannedImage && (
                <div>
                    <h3>Scanned Image:</h3>
                    <img src={scannedImage} alt="Scanned Document" />
                </div>
            )}
        </div>
    );
};

export default DocumentScanner;
