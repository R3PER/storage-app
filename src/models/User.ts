import bcrypt from 'bcryptjs';
import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  group: string;
  active: boolean;
  approved: boolean;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: Date;
  lastActive?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isOnline(): boolean;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    sparse: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: [true, 'Imię jest wymagane'],
  },
  lastName: {
    type: String,
    required: [true, 'Nazwisko jest wymagane'],
  },
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
  },
  password: {
    type: String,
  },
  lastActive: {
    type: Date,
  },
  group: {
    type: String,
    required: [true, 'Grupa jest wymagana'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    id: String,
    firstName: String,
    lastName: String
  },
  approvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isOnline = function(): boolean {
  if (!this.lastActive) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastActive > fiveMinutesAgo;
};

// Custom method to check if user can access the system
userSchema.methods.canAccessSystem = function(): boolean {
  return this.active && this.approved;
};

// Custom method to approve user
userSchema.methods.approveUser = async function(approver: { id: string; firstName: string; lastName: string }): Promise<void> {
  this.approved = true;
  this.approvedBy = approver;
  this.approvedAt = new Date();
  await this.save();
};

// Custom method to ban user
userSchema.methods.banUser = async function(): Promise<void> {
  this.active = false;
  await this.save();
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
