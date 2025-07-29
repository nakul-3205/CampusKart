import { NextResponse } from 'next/server';
import {askGemini} from '@/lib/chat'
export async function POST(req: Request) {
  const { message } = await req.json();
  const reply = await askGemini(message);
//   console.log(reply,message)
  return NextResponse.json({ reply });
}
