import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

export async function POST(_request: NextRequest) {
  // Process request if needed in the future
  // const body = await _request.json()
  
  // Here you can process PostHog events if needed
  // For example, you could log them to your server or forward them to another service
  
  return NextResponse.json({ status: 'ok' })
}
