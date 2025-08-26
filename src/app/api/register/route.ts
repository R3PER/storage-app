import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import UserModel from '../../../models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { username, email, password, firstName, lastName } = await request.json();

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Wszystkie pola są wymagane' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Nieprawidłowy format adresu email' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [
        { email },
        { username }
      ]
    }).select('email username').lean() as { email: string; username: string } | null;

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'nazwa użytkownika';
      return NextResponse.json(
        { message: `Użytkownik z takim ${field} już istnieje` },
        { status: 400 }
      );
    }

    // Create new user with approval status
    await UserModel.create({
      username,
      email,
      password,
      firstName,
      lastName,
      group: 'user',
      active: true,      // Account is active but needs approval
      approved: false,   // New users need admin approval
      createdAt: new Date()
    });

    return NextResponse.json(
      { 
        message: 'Rejestracja zakończona sukcesem. Twoje konto oczekuje na zatwierdzenie przez administratora.',
        status: 'pending_approval'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { message: `Ten ${field === 'email' ? 'email' : 'użytkownik'} jest już zajęty` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.' },
      { status: 500 }
    );
  }
}
