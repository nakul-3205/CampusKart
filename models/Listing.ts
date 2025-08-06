import mongoose, { Schema, model, models } from 'mongoose';

export interface IListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category:string
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  status: 'active' | 'sold';
  image: string;
  isPinned: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const ListingSchema = new Schema<IListing>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category:{type:String,required:true},
  sellerId: { type: String, required: true },
  sellerName: { type: String },
  sellerEmail: { type: String },
  status: {type: String,enum: ["active", "sold"],default: "active",},
  image: { type: String },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

const Listing = models.Listing || model<IListing>('Listing', ListingSchema);
export default Listing;
