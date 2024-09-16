"use client"; // Mark this file as a client component

import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';

const CanvasPDFViewer = ({ pdfUrl }) => {
    
  const [loading, setLoading] = useState(true);
  const [signatureBoxes, setSignatureBoxes] = useState([]); // Signature boxes state
  const [users] = useState([
    { id: 1, name: 'John Doe', type: 'Signature' },
    { id: 2, name: 'Jane Smith', type: 'Initial' },
    { id: 3, name: 'Alice Johnson', type: 'Signature' },
  ]); // Sample users state
  const [draggedUser, setDraggedUser] = useState(null); // Track dragged user
  const canvasRefs = useRef([]); // Store refs to canvases

  useEffect(() => {
    const loadPdf = async () => {
      if (canvasRefs.current.length === 0) return;

      // Dynamically import pdfjs-dist
      const pdfjsLib = (await import('pdfjs-dist'));

      // Ensure the PDF.js worker is correctly set up
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

      try {
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        // Render each page on the canvas
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);

          // Get the correct canvas from refs
          const canvas = canvasRefs.current[pageNumber - 1];
          const context = canvas.getContext('2d');

          // Set canvas dimensions
          const viewport = page.getViewport({ scale: 1 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Set the background color of the canvas
          context.fillStyle = '#ffffff'; // White background for the PDF content
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Render the page on the canvas
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
  }, [pdfUrl]);

  // Add a signature box
  const addSignatureBox = (user, x, y) => {
    const newBox = {
      id: Date.now(), // Unique ID
      userName: `${user.name} (${user.type})`, // Name and type for the user associated with the box
      x,
      y,
      width: 150,
      height: 50,
    };
    setSignatureBoxes((prevBoxes) => [...prevBoxes, newBox]);
  };

  // Handle drag/resize of signature box
  const handleBoxUpdate = (id, x, y, width, height) => {
    const updatedBoxes = signatureBoxes.map((box) =>
      box.id === id ? { ...box, x, y, width, height } : box
    );
    setSignatureBoxes(updatedBoxes);
  };

  // Handle drag start
  const handleDragStart = (user) => {
    setDraggedUser(user);
  };

  // Handle drop on the PDF canvas
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedUser && canvasRefs.current[0]) {
      const rect = canvasRefs.current[0].getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addSignatureBox(draggedUser, x, y);
      setDraggedUser(null); // Reset dragged user after drop
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f0f0f0', // Light background for the container
        padding: '10px', // Padding around the container
        display: 'flex', // Flex container
        flexDirection: 'row', // Sidebar and PDF in a row
        alignItems: 'flex-start', // Align PDF and sidebar at the top
        position: 'relative', // For signature box positioning
      }}
    >
      {/* PDF Canvas and Signature Boxes */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()} // Allow dropping
        style={{
          position: 'relative', // Allow signature boxes to overlay the PDF
          width: '80%', // 80% width for the PDF area
          display: 'flex', // Flex container to center canvases
          flexDirection: 'column', // Stack canvases vertically
          alignItems: 'center', // Center canvases horizontally
          backgroundColor: '#fff', // White background for PDF area
          padding: '10px',
        }}
      >
        {loading && <p>Loading...</p>}
        {/* Render canvases directly in JSX */}
        {[...Array(3)].map((_, index) => (
          <canvas
            key={index}
            ref={(el) => (canvasRefs.current[index] = el)} // Store each canvas in the ref array
            style={{
              marginBottom: '20px', // Space between canvases
              display: 'block',
            }}
          />
        ))}
        {/* Render signature boxes */}
        {signatureBoxes.map((box) => (
          <Rnd
            key={box.id}
            default={{
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            }}
            bounds="parent" // Confine within the PDF container
            onDragStop={(e, d) => handleBoxUpdate(box.id, d.x, d.y, box.width, box.height)}
            onResizeStop={(e, direction, ref, delta, position) =>
              handleBoxUpdate(box.id, position.x, position.y, ref.offsetWidth, ref.offsetHeight)
            }
            style={{
              border: '2px dashed #000',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {box.userName}
            </div>
          </Rnd>
        ))}
      </div>

      {/* Sidebar for Users */}
      <div
        style={{
          width: '20%', // Sidebar width
          backgroundColor: '#eaeaea', // Light gray background
          padding: '10px',
          marginLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h3>Users</h3>
        {users.map((user) => (
          <div
            key={user.id}
            draggable
            onDragStart={() => handleDragStart(user)}
            style={{
              margin: '10px 0',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              cursor: 'grab',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {user.name} ({user.type})
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasPDFViewer;
