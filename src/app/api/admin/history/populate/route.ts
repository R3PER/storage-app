import { ApiError, checkAdminAuth, createApiResponse, handleApiError } from '../../../../../lib/api-utils';
import { connectDB } from '../../../../../lib/mongodb';
import History from '../../../../../models/History';
import Product from '../../../../../models/Product';
import User from '../../../../../models/User';

export async function POST(request: Request) {
  try {
    console.log('POST /api/admin/history/populate - Starting request');
    
    console.log('Checking admin authentication...');
    await checkAdminAuth();
    
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connection established');

    console.log('Clearing existing history...');
    await History.deleteMany({});
    console.log('Existing history cleared');

    console.log('Fetching products and users...');
    const [products, users] = await Promise.all([
      Product.find().lean(),
      User.find().lean()
    ]);
    console.log(`Found ${products.length} products and ${users.length} users`);

    const historyEntries = [];

    // Process each user
    for (const user of users) {
      if (!user.firstName || !user.lastName) {
        console.warn(`Skipping user ${user._id} due to missing name information`);
        continue;
      }

      // Add user creation entry
      historyEntries.push({
        type: 'user_create',
        userId: user._id,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        details: `Utworzono użytkownika: ${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt || new Date(0),
        metadata: user.email ? {
          email: user.email,
          affectedFields: ['firstName', 'lastName', 'email']
        } : undefined
      });

      // Add role assignment entry if user has roles
      if (user.roles && user.roles.length > 0) {
        historyEntries.push({
          type: 'user_role_change',
          userId: user._id,
          userFirstName: user.firstName,
          userLastName: user.lastName,
          details: `Przypisano role użytkownikowi`,
          timestamp: user.updatedAt || user.createdAt || new Date(0),
          metadata: {
            newValue: user.roles.join(', '),
            affectedFields: ['roles']
          }
        });
      }

      // Add ban entry if user is not active
      if (user.active === false) {
        historyEntries.push({
          type: 'user_ban',
          userId: user._id,
          userFirstName: user.firstName,
          userLastName: user.lastName,
          details: `Zablokowano konto użytkownika`,
          timestamp: user.updatedAt || new Date(0),
          metadata: {
            reason: 'Konto zostało zablokowane przez administratora'
          }
        });
      }
    }

    // Process each product
    for (const product of products) {
      if (!product.name || !product.createdBy) {
        console.warn(`Skipping product ${product._id} due to missing required information`);
        continue;
      }

      // Add product creation entry
      historyEntries.push({
        type: 'product_create',
        productId: product._id,
        productName: product.name,
        userId: product.createdBy.id,
        userFirstName: product.createdBy.firstName,
        userLastName: product.createdBy.lastName,
        details: `Utworzono produkt: ${product.name}`,
        timestamp: product.createdAt || new Date(0),
        metadata: {
          quantity: product.quantity || 0,
          price: product.price || 0,
          affectedFields: ['name', 'quantity', 'price']
        }
      });

      // Add separate entries for quantity and price updates if edited
      if (product.lastEditedAt) {
        if (product.quantity !== undefined) {
          historyEntries.push({
            type: 'inventory_update',
            productId: product._id,
            productName: product.name,
            userId: product.lastEditedBy.id,
            userFirstName: product.lastEditedBy.firstName,
            userLastName: product.lastEditedBy.lastName,
            details: `Zaktualizowano stan magazynowy produktu: ${product.name}`,
            timestamp: product.lastEditedAt,
            metadata: {
              newValue: product.quantity,
              affectedFields: ['quantity']
            }
          });
        }

        if (product.price !== undefined) {
          historyEntries.push({
            type: 'price_update',
            productId: product._id,
            productName: product.name,
            userId: product.lastEditedBy.id,
            userFirstName: product.lastEditedBy.firstName,
            userLastName: product.lastEditedBy.lastName,
            details: `Zaktualizowano cenę produktu: ${product.name}`,
            timestamp: product.lastEditedAt,
            metadata: {
              newValue: `${product.price}zł`,
              affectedFields: ['price']
            }
          });
        }
      }

      // Process notes
      if (product.notes && product.notes.length > 0) {
        for (const note of product.notes) {
          // Add note creation entry
          historyEntries.push({
            type: 'note_add',
            productId: product._id,
            productName: product.name,
            userId: note.createdBy.id,
            userFirstName: note.createdBy.firstName,
            userLastName: note.createdBy.lastName,
            details: `Dodano notatkę do produktu: ${product.name}`,
            metadata: note.content ? {
              content: note.content.substring(0, 50) + (note.content.length > 50 ? '...' : ''),
              affectedFields: ['notes']
            } : undefined,
            timestamp: note.createdAt,
            noteId: note._id
          });

          // Add note update entry if edited
          if (note.updatedAt) {
            historyEntries.push({
              type: 'note_edit',
              productId: product._id,
              productName: product.name,
              userId: note.updatedBy.id,
              userFirstName: note.updatedBy.firstName,
              userLastName: note.updatedBy.lastName,
              details: `Zaktualizowano notatkę w produkcie: ${product.name}`,
              metadata: note.content ? {
                content: note.content.substring(0, 50) + (note.content.length > 50 ? '...' : ''),
                affectedFields: ['notes']
              } : undefined,
              timestamp: note.updatedAt,
              noteId: note._id
            });
          }
        }
      }
    }

    if (historyEntries.length === 0) {
      return createApiResponse({
        message: 'Brak danych do zaktualizowania historii',
        entriesCount: 0
      });
    }

    // Sort entries by timestamp
    historyEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Insert all history entries in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < historyEntries.length; i += batchSize) {
      const batch = historyEntries.slice(i, i + batchSize);
      await History.insertMany(batch);
    }

    return createApiResponse({
      message: 'Historia została zaktualizowana',
      entriesCount: historyEntries.length
    });
  } catch (error) {
    console.error('Error in POST /api/admin/history/populate:', error);
    if (error instanceof Error) {
      return handleApiError(new ApiError(error.message, 500));
    }
    return handleApiError(new ApiError('Failed to populate history', 500));
  }
}
