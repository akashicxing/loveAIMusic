import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'musicStyles.json');
    const fileContents = await readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading music styles file:', error);
    return NextResponse.json(
      { error: 'Failed to load music styles' },
      { status: 500 }
    );
  }
}
