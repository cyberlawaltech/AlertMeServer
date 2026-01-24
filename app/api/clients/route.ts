import { NextRequest, NextResponse } from 'next/server';

// This is a simple implementation. In production, fetch from your actual database/server
// For now, we'll proxy to the Socket.IO server

export async function GET(request: NextRequest) {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';
    
    const response = await fetch(`${serverUrl}/api/clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
