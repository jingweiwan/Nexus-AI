import { NextResponse } from 'next/server';
import { createClient } from '@vercel/edge-config';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || 'modelConfig';
  const client = createClient(process.env.EDGE_CONFIG);
  const edgeConfig = await client.get(key);
  return NextResponse.json(edgeConfig);
}