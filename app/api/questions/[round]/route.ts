import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { round: string } }
) {
  try {
    const { round } = params;

    const fileName = `${round}.json`;
    const filePath = path.join(process.cwd(), 'data', fileName);
    const fileContents = await readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading question file:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}
