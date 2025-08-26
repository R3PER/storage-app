import mongoose, { Document } from 'mongoose';

export interface IProductNote {
  content: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  updatedAt?: Date;
  isNew: boolean;
  isUpdated: boolean;
}

export interface IProduct extends Document {
  owner: string;
  name: string;
  quantity: number;
  price: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  lastEditedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lastEditedAt?: Date;
  notes: IProductNote[];
}

const noteSchema = new mongoose.Schema<IProductNote>({
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    id: String,
    firstName: String,
    lastName: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    id: String,
    firstName: String,
    lastName: String,
  },
  updatedAt: Date,
  isNew: {
    type: Boolean,
    default: true,
  },
  isUpdated: {
    type: Boolean,
    default: false,
  }
});

const productSchema = new mongoose.Schema<IProduct>({
  owner: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdBy: {
    id: String,
    firstName: String,
    lastName: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastEditedBy: {
    id: String,
    firstName: String,
    lastName: String,
  },
  lastEditedAt: Date,
  notes: [noteSchema],
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
