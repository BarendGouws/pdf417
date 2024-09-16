// app/api/convert/route.js

import path from 'path';
import fs from 'fs/promises';
import tmp from 'tmp';
import { promisify } from 'util';
import libre from 'libreoffice-convert';

// Promisify the convert function
libre.convertAsync = promisify(libre.convert);

// Create a temporary directory
const createTempDir = promisify(tmp.dir);

export async function GET(request) {
  // Define the input and output paths
  const inputPath = path.resolve('.', 'files', 'input.docx'); 
  const outputPath = path.resolve('.', 'files', 'output.pdf'); 

  try {
    // Create a temporary directory
    const tempDir = await createTempDir({ unsafeCleanup: true });

    // Read DOCX file
    const docxBuf = await fs.readFile(inputPath);

    // Convert to PDF
    const pdfBuf = await libre.convertAsync(docxBuf, '.pdf', { tempDir });

    // Save PDF file
    await fs.writeFile(outputPath, pdfBuf);

    // Send back the converted file
    return new Response(pdfBuf, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename=converted.pdf',
        'Content-Type': 'application/pdf',
      },
    });
  } catch (err) {
    console.error('Error converting file:', err);
    return new Response(JSON.stringify({ error: 'Error converting the file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
