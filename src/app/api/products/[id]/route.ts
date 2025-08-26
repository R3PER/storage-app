import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        ...data,
        lastEditedBy: session.user?.firstName,
        lastEditedAt: new Date(),
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: 'Produkt nie znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: 'Błąd podczas aktualizacji produktu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json(
        { message: 'Produkt nie znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Produkt usunięty' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Błąd podczas usuwania produktu' },
      { status: 500 }
    );
  }
}