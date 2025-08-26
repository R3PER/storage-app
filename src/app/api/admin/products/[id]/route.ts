import { Product } from '../../../../../app/admin/types/admin';
import {
  ApiError,
  checkAdminAuth,
  createApiResponse,
  handleApiError,
} from '../../../../../lib/api-utils';
import { connectDB } from '../../../../../lib/mongodb';
import History from '../../../../../models/History';
import ProductModel, { IProduct, IProductNote } from '../../../../../models/Product';

// GET /api/admin/products/[id]
// GET /api/admin/products/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminAuth();
    await connectDB();

    const { id } = params;
    if (!id) {
      throw new ApiError('Product ID is required', 400);
    }

    const product = await ProductModel.findById(id).lean() as IProduct;
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    // Map the Mongoose document to the Product type
    const mappedProduct: Product = {
      _id: product._id.toString(),
      owner: product.owner,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      lastEditedBy: product.lastEditedBy,
      lastEditedAt: product.lastEditedAt,
      notes: product.notes.map((note: IProductNote) => ({
        content: note.content,
        createdBy: note.createdBy,
        createdAt: note.createdAt,
        updatedBy: note.updatedBy,
        updatedAt: note.updatedAt,
        isNew: note.isNew,
        isUpdated: note.isUpdated
      }))
    };

    return createApiResponse(mappedProduct);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkAdminAuth();
    await connectDB();

    const { id } = params;
    const data = await request.json();
    const { notes, ...updateData } = data;

    // Find the product
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    // Store old values for history
    const oldValues = {
      name: product.name,
      quantity: product.quantity,
      price: product.price
    };

    // Update product fields
    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.quantity !== undefined) product.quantity = updateData.quantity;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.owner !== undefined) product.owner = updateData.owner;

    // Add note if provided
    if (notes?.length > 0) {
      const lastNote: { content: string } = notes[notes.length - 1];
      const note: Omit<IProductNote, 'updatedBy' | 'updatedAt'> = {
        content: lastNote.content,
        createdBy: {
          id: session.user.id,
          firstName: session.user.firstName,
          lastName: session.user.lastName
        },
        createdAt: new Date(),
        isNew: true,
        isUpdated: false
      };
      product.notes.push(note);

      // Create history entry for note addition
      await History.create({
        type: 'note_add',
        productId: product._id,
        productName: product.name,
        userId: session.user.id,
        userFirstName: session.user.firstName,
        userLastName: session.user.lastName,
        details: `Dodano notatkę: "${lastNote.content}"`,
        noteId: product.notes[product.notes.length - 1]._id,
        timestamp: new Date()
      });
    }

    // Update last edited info
    product.lastEditedBy = {
      id: session.user.id,
      firstName: session.user.firstName,
      lastName: session.user.lastName
    };
    product.lastEditedAt = new Date();

    await product.save();

    // Create history entry for product update
    const changes = [];
    if (oldValues.name !== product.name) changes.push(`nazwa: ${oldValues.name} → ${product.name}`);
    if (oldValues.quantity !== product.quantity) changes.push(`ilość: ${oldValues.quantity} → ${product.quantity}`);
    if (oldValues.price !== product.price) changes.push(`cena: ${oldValues.price} → ${product.price}`);

    if (changes.length > 0) {
      await History.create({
        type: 'product_update',
        productId: product._id,
        productName: product.name,
        userId: session.user.id,
        userFirstName: session.user.firstName,
        userLastName: session.user.lastName,
        details: `Zaktualizowano produkt: ${changes.join(', ')}`,
        timestamp: new Date()
      });
    }

    // Map the updated product to the response format
    const mappedProduct: Product = {
      _id: product._id.toString(),
      owner: product.owner,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      lastEditedBy: product.lastEditedBy,
      lastEditedAt: product.lastEditedAt,
      notes: product.notes.map((note: IProductNote) => ({
        content: note.content,
        createdBy: note.createdBy,
        createdAt: note.createdAt,
        updatedBy: note.updatedBy,
        updatedAt: note.updatedAt,
        isNew: note.isNew,
        isUpdated: note.isUpdated
      }))
    };

    return createApiResponse(mappedProduct);
  } catch (error) {
    return handleApiError(error);
  }
}
