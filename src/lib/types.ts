// src/lib/types.ts
/**
 * Database Types
 * Type definitions for MongoDB models and documents.
 */

import { Document, Model } from 'mongoose';

export interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ProductNote {
  content: string;
  createdBy: UserDetails;
  createdAt: Date;
  updatedBy?: UserDetails;
  updatedAt?: Date;
  isNew: boolean;
  isUpdated: boolean;
}

export interface IProduct {
  owner: string;
  name: string;
  quantity: number;
  price: number;
  createdBy: UserDetails;
  createdAt: Date;
  lastEditedBy?: UserDetails;
  lastEditedAt?: Date;
  notes?: ProductNote[];
}

export interface ProductDocument extends Document, IProduct {
  addNote(content: string, user: UserDetails): Promise<ProductDocument>;
  updateQuantity(newQuantity: number, user: UserDetails): Promise<ProductDocument>;
  totalValue: number;
  isLowStock: boolean;
}

export interface ProductModel extends Model<ProductDocument> {
  findByName(name: string): Promise<ProductDocument[]>;
}
