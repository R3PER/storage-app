import {
  ApiError,
  checkAdminAuth,
  createApiResponse,
  handleApiError,
  isProduct,
  parseFilterParams,
  parsePaginationParams,
  parseSortParams
} from '../../../../lib/api-utils';
import { connectDB } from '../../../../lib/mongodb';
import History from '../../../../models/History';
import ProductModel from '../../../../models/Product';

// GET /api/admin/products
export async function GET(request: Request) {
  try {
    await checkAdminAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);
    const { field: sortField, order: sortOrder } = parseSortParams(searchParams);
    const { search, minQuantity, maxQuantity, minPrice, maxPrice } = parseFilterParams(searchParams);

    // Build query with proper null handling
    let query: any = {};

    // Add quantity filter if values are provided
    if (minQuantity !== undefined || maxQuantity !== undefined) {
      query.quantity = {};
      if (minQuantity !== undefined) query.quantity.$gte = minQuantity;
      if (maxQuantity !== undefined) query.quantity.$lte = maxQuantity;
    }

    // Add price filter if values are provided
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'notes.content': { $regex: search, $options: 'i' } }
      ];
    }

    // Ensure price and quantity exist
    query.$and = [
      { price: { $exists: true, $ne: null } },
      { quantity: { $exists: true, $ne: null } }
    ];

    // Execute query with pagination
    const products = await ProductModel.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await ProductModel.countDocuments(query);

    // Calculate statistics with proper null handling
    const [totalValueResult, averagePriceResult, totalQuantityResult, lowStockItems] = await Promise.all([
      ProductModel.aggregate([
        { 
          $match: {
            ...query,
            price: { $exists: true, $ne: null },
            quantity: { $exists: true, $ne: null }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $multiply: [
                  { $ifNull: ['$price', 0] },
                  { $ifNull: ['$quantity', 0] }
                ] 
              } 
            } 
          } 
        }
      ]),
      ProductModel.aggregate([
        { 
          $match: {
            ...query,
            price: { $exists: true, $ne: null }
          }
        },
        { 
          $group: { 
            _id: null, 
            avg: { $avg: '$price' } 
          } 
        }
      ]),
      ProductModel.aggregate([
        { 
          $match: {
            ...query,
            quantity: { $exists: true, $ne: null }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: { $ifNull: ['$quantity', 0] } } 
          } 
        }
      ]),
      ProductModel.countDocuments({ 
        ...query, 
        quantity: { $exists: true, $ne: null, $lt: 10 } 
      })
    ]);

    const totalValue = totalValueResult[0]?.total || 0;
    const averagePrice = averagePriceResult[0]?.avg || 0;
    const totalQuantity = totalQuantityResult[0]?.total || 0;

    console.log('GET /api/admin/products - Query:', query);
    console.log(`Found ${products.length} products out of ${total} total`);

    const mappedProducts = products.map((product: any) => ({
      _id: product._id.toString(),
      owner: product.owner,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      lastEditedBy: product.lastEditedBy,
      lastEditedAt: product.lastEditedAt,
      notes: product.notes || []
    }));

    const response = {
      items: mappedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalProducts: total,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockItems,
        averagePrice: Math.round(averagePrice * 100) / 100,
        totalQuantity
      }
    };

    console.log('Sending products response:', response);
    return createApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/products
export async function POST(request: Request) {
  try {
    const session = await checkAdminAuth();
    await connectDB();

    const data = await request.json();
    if (!isProduct(data)) {
      throw new ApiError('Invalid product data', 400);
    }

    const product = await ProductModel.create({
      ...data,
      createdBy: {
        id: session.user.id,
        firstName: session.user.firstName,
        lastName: session.user.lastName
      },
      createdAt: new Date()
    });

    // Create history entry for product creation
    await History.create({
      type: 'product_create',
      productId: product._id,
      productName: product.name,
      userId: session.user.id,
      userFirstName: session.user.firstName,
      userLastName: session.user.lastName,
      details: `Utworzono produkt "${product.name}"`,
      timestamp: new Date()
    });

    return createApiResponse(product, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/admin/products
export async function PUT(request: Request) {
  try {
    const session = await checkAdminAuth();
    await connectDB();

    const data = await request.json();
    const { _id, notes, ...updateData } = data;

    if (!_id) {
      throw new ApiError('Product ID is required', 400);
    }

    // Validate only the fields that are present in updateData
    const fieldsToValidate = {
      name: updateData.name,
      quantity: updateData.quantity,
      price: updateData.price,
      owner: updateData.owner
    };

    if (!isProduct(fieldsToValidate)) {
      throw new ApiError('Invalid product data', 400);
    }

    const product = await ProductModel.findById(_id);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    const oldValues = {
      name: product.name,
      quantity: product.quantity,
      price: product.price
    };

    // Update only the fields that are present in updateData
    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.quantity !== undefined) product.quantity = updateData.quantity;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.owner !== undefined) product.owner = updateData.owner;

    // Add note if provided
    if (notes?.length > 0) {
      const lastNote = notes[notes.length - 1];
      const note = {
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

    return createApiResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/products
export async function DELETE(request: Request) {
  try {
    const session = await checkAdminAuth();
    await connectDB();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      throw new ApiError('Product ID is required', 400);
    }

    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    // Create history entry for product deletion
    await History.create({
      type: 'product_update',
      productId: product._id,
      productName: product.name,
      userId: session.user.id,
      userFirstName: session.user.firstName,
      userLastName: session.user.lastName,
      details: `Usunięto produkt "${product.name}"`,
      timestamp: new Date()
    });

    return createApiResponse({
      message: 'Product deleted successfully',
      deletedProduct: product
    });
  } catch (error) {
    return handleApiError(error);
  }
}
