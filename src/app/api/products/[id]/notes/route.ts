import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import History from '../../../../../models/History';
import Product from '../../../../../models/Product';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { content } = await request.json();

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        $push: {
          notes: {
            content,
            createdBy: {
              id: session.user.id,
              firstName: session.user.firstName,
              lastName: session.user.lastName
            },
            createdAt: new Date(),
            isNew: true,
            isUpdated: false
          }
        }
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Create history entry for note addition
    const newNote = product.notes[product.notes.length - 1];
    await History.create({
      type: 'note_add',
      productId: product._id,
      productName: product.name,
      userId: session.user.id,
      userFirstName: session.user.firstName,
      userLastName: session.user.lastName,
      details: `Dodano notatkę: "${content}"`,
      noteId: newNote._id,
      timestamp: new Date()
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Add note error:', error);
    return NextResponse.json(
      { message: 'Error adding note' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { noteId, content } = await request.json();

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    const note = product.notes.id(noteId);
    if (!note) {
      return NextResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }

    const oldContent = note.content;
    note.content = content;
    note.updatedBy = {
      id: session.user.id,
      firstName: session.user.firstName,
      lastName: session.user.lastName
    };
    note.updatedAt = new Date();
    note.isUpdated = true;

    await product.save();

    // Create history entry for note update
    await History.create({
      type: 'note_edit',
      productId: product._id,
      productName: product.name,
      userId: session.user.id,
      userFirstName: session.user.firstName,
      userLastName: session.user.lastName,
      details: `Zaktualizowano notatkę z "${oldContent}" na "${content}"`,
      noteId: noteId,
      timestamp: new Date()
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json(
      { message: 'Error updating note' },
      { status: 500 }
    );
  }
}
