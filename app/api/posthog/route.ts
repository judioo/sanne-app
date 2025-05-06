import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Here you can process PostHog events if needed
  // For example, you could log them to your server or forward them to another service
  
  return NextResponse.json({ status: 'ok' })
}
