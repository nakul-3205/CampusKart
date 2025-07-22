import mongoose, { Schema, model, models } from 'mongoose';

export interface IPayment {
  _id: string;
  userId: string;
  amount: number;
  type: 'listing' | 'pin';
  listingId?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['listing', 'pin'], required: true },
  listingId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Payment = models.Payment || model<IPayment>('Payment', PaymentSchema);
export default Payment;
