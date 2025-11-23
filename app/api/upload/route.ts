import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { generateUniqueFilename, validateImageFile } from '../../../lib/imageUpload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folder) {
      return NextResponse.json({ error: 'No folder specified' }, { status: 400 });
    }

    // Validate the image file
    validateImageFile(file);

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    
    // Create the upload directory path
    const uploadDir = path.join(process.cwd(), 'public', folder);
    
    // Ensure the directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Define the file path
    const filePath = path.join(uploadDir, filename);
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write the file
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/${folder}/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}