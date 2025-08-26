import { startOfMonth, subMonths } from 'date-fns';
import {
  checkAdminAuth,
  createApiResponse,
  handleApiError
} from '../../../../lib/api-utils';
import { connectDB } from '../../../../lib/mongodb';
import ProductModel from '../../../../models/Product';

export async function GET() {
  try {
    console.log('GET /api/admin/stats - Starting request');
    
    console.log('Checking admin authentication...');
    await checkAdminAuth();
    
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connection established');

    console.log('Fetching basic stats...');
    const [totalProducts, totalValueResult, averagePriceResult, lowStockItems] = await Promise.all([
      ProductModel.countDocuments(),
      ProductModel.aggregate([
        {
          $match: {
            price: { $exists: true, $ne: null },
            quantity: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            totalValue: { 
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
            price: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            averagePrice: { $avg: '$price' }
          }
        }
      ]),
      ProductModel.countDocuments({ quantity: { $lt: 10 } })
    ]);

    const totalValue = totalValueResult[0]?.totalValue || 0;
    const averagePrice = averagePriceResult[0]?.averagePrice || 0;

    // Get monthly stats with proper date handling
    const currentMonth = startOfMonth(new Date());
    const lastMonth = startOfMonth(subMonths(new Date(), 1));

    const [currentMonthStats, lastMonthStats] = await Promise.all([
      ProductModel.aggregate([
        {
          $match: {
            lastEditedAt: { $gte: currentMonth },
            price: { $exists: true, $ne: null },
            quantity: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            monthlyRevenue: { 
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
            lastEditedAt: { 
              $gte: lastMonth,
              $lt: currentMonth
            },
            price: { $exists: true, $ne: null },
            quantity: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            lastMonthRevenue: { 
              $sum: { 
                $multiply: [
                  { $ifNull: ['$price', 0] }, 
                  { $ifNull: ['$quantity', 0] }
                ] 
              } 
            }
          }
        }
      ])
    ]);

    const monthlyRevenue = currentMonthStats[0]?.monthlyRevenue || 0;
    const lastMonthRevenue = lastMonthStats[0]?.lastMonthRevenue || 0;

    // Calculate revenue growth with null safety
    const revenueGrowth = lastMonthRevenue > 0 ? 
      ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Get inventory trends (last 6 months) with proper date handling
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const inventoryTrends = await ProductModel.aggregate([
      {
        $match: {
          lastEditedAt: { $gte: sixMonthsAgo },
          price: { $exists: true, $ne: null },
          quantity: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$lastEditedAt' },
            month: { $month: '$lastEditedAt' }
          },
          totalValue: { 
            $sum: { 
              $multiply: [
                { $ifNull: ['$price', 0] }, 
                { $ifNull: ['$quantity', 0] }
              ] 
            } 
          },
          totalQuantity: { $sum: { $ifNull: ['$quantity', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format trends data with proper labels
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    const trends = {
      revenue: {
        labels: inventoryTrends.map(t => `${monthNames[t._id.month - 1]} ${t._id.year}`),
        values: inventoryTrends.map(t => Math.round(t.totalValue * 100) / 100)
      },
      inventory: {
        labels: inventoryTrends.map(t => `${monthNames[t._id.month - 1]} ${t._id.year}`),
        values: inventoryTrends.map(t => t.totalQuantity)
      }
    };

    const response = {
      basicStats: {
        totalProducts,
        totalValue: Math.round(totalValue * 100) / 100,
        averagePrice: Math.round(averagePrice * 100) / 100,
        lowStockItems,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      trends,
      lastUpdated: new Date().toISOString()
    };

    console.log('Sending stats response:', response);
    return createApiResponse(response);
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return handleApiError(error);
  }
}
