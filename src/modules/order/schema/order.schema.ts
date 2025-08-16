import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    required: true,
  })
  order_items: {
    product: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];

  @Prop({
    type: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, required: true },
    },
    required: true,
  })
  shipping_address: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };

  @Prop({ required: true })
  payment_method: string;

  @Prop({
    type: {
      id: { type: String },
      status: { type: String },
      update_time: { type: Date },
      email_address: { type: String },
    },
  })
  payment_result?: {
    id?: string;
    status?: string;
    update_time?: Date;
    email_address?: string;
  };

  @Prop({ type: Number, required: true, default: 0 })
  tax_price: number;

  @Prop({ type: Number, required: true, default: 0 })
  shipping_price: number;

  @Prop({ type: Number, required: true })
  total_price: number;

  @Prop({
    type: String,
    required: true,
    default: 'pending', // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  })
  order_status: string;

  @Prop({ type: Boolean, required: true, default: false })
  is_paid: boolean;

  @Prop({ type: Date })
  paid_at?: Date;

  @Prop({ type: Boolean, required: true, default: false })
  is_delivered: boolean;

  @Prop({ type: Date })
  delivered_at?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
