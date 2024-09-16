"use client"; // Mark this file as a client component

import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';

const CanvasPDFViewer = ({ pdfUrl }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      if (!containerRef.current) return;

      // Dynamically import pdfjs-dist
      const pdfjsLib = (await import('pdfjs-dist'));

      // Ensure the PDF.js worker is correctly set up
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`; //'/pdfjs/pdf.worker.min.js';

      const container = containerRef.current;

      try {
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        // Clear the container before adding new canvases
        container.innerHTML = '';

        // Render each page
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);

          // Create a new canvas element for each page
          const canvas = document.createElement('canvas');
          container.appendChild(canvas);

          // Set canvas dimensions
          const viewport = page.getViewport({ scale: 1 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Set the background color of the canvas
          const context = canvas.getContext('2d');
          context.fillStyle = '#ffffff'; // White background for the PDF content
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Add margin to canvas for spacing between pages
          canvas.style.marginBottom = '20px'; // Adjust gap between pages here

          // Ensure the canvas behaves as a block element (stacks vertically)
          canvas.style.display = 'block';

          // Render the page
          const renderContext = {
            canvasContext: context,
            viewport,
          };
          await page.render(renderContext).promise;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();

    // Cleanup function to clear canvases if component unmounts or url changes
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear canvases
      }
    };
  }, [pdfUrl]);

  

  return (
    <div
      style={{
        backgroundColor: '#f0f0f0', // Light background for the container
        padding: '10px', // Padding around the container
        display: 'flex', // Flex container
        flexDirection: 'column', // Ensure vertical stacking
        alignItems: 'center', // Center canvases horizontally
      }}
    >
      {loading && <p>Loading...</p>}
      <div ref={containerRef} />
    </div>
  );
};

export default CanvasPDFViewer;
