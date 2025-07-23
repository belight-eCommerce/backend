import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, default: 0 })
  stock_quantity: number;

  @Prop()
  discount?: number;

  @Prop({ default: 0 })
  ratings: number;

  @Prop({ default: 0 })
  num_reviews: number;

  @Prop({ default: true })
  is_available: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);