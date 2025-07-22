import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  clerkId: string;
  email: string;
  first_name: string;
  last_name: string;
  image: string;
  listingsCount: number;
  pinnedListings: string[];
  credits: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  image: { type: String },
  listingsCount: { type: Number, default: 0 },
  pinnedListings: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  credits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model<IUser>('User', UserSchema);
export default User;
