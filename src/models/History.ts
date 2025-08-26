import mongoose, { Document } from 'mongoose';

export interface IHistory extends Document {
  type: 'product_update' | 'product_create' | 'product_delete' | 
        'note_add' | 'note_edit' | 'note_delete' |
        'user_update' | 'user_create' | 'user_delete' | 'user_ban' | 'user_role_change' |
        'inventory_update' | 'price_update';
  productId?: string;
  productName?: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  details: string;
  timestamp: Date;
  noteId?: string;
}

export interface IHistoryMetadata {
  previousValue?: string | number;
  newValue?: string | number;
  reason?: string;
  affectedFields?: string[];
  [key: string]: any;
}

const historySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'product_update', 'product_create', 'product_delete',
      'note_add', 'note_edit', 'note_delete',
      'user_update', 'user_create', 'user_delete', 'user_ban', 'user_role_change',
      'inventory_update', 'price_update'
    ]
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    required: false
  },
  userId: {
    type: String,
    required: true
  },
  userFirstName: {
    type: String,
    required: true
  },
  userLastName: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  metadata: {
    type: Object,
    required: false,
    default: undefined
  }
});

export default mongoose.models.History || mongoose.model<IHistory>('History', historySchema);
