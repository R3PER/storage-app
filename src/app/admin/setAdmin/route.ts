// src/app/admin/setAdmin/route.ts
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username jest wymagany' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await UserModel.findOneAndUpdate(
      { username },
      { $set: { group: 'admin' } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Użytkownik nie znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Nadano uprawnienia administratora dla użytkownika ${username}`,
      user: {
        username: user.username,
        group: user.group
      }
    });

  } catch (error) {
    console.error('Błąd podczas nadawania uprawnień:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}