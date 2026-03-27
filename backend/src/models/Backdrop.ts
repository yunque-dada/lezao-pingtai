import mongoose, { Document, Schema } from 'mongoose';

export interface IBackdrop extends Document {
  name: string;
  tags: string[];
  assetId: string;
  bitmapResolution: number;
  dataFormat: string;
  md5ext: string;
  rotationCenterX: number;
  rotationCenterY: number;
  thumbnailUrl?: string;
  downloadCount: number;
  createdBy?: mongoose.Types.ObjectId;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const backdropSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    assetId: {
      type: String,
      required: true,
      unique: true,
    },
    bitmapResolution: {
      type: Number,
      default: 1,
    },
    dataFormat: {
      type: String,
      required: true,
      enum: ['svg', 'png', 'jpg', 'jpeg'],
    },
    md5ext: {
      type: String,
      required: true,
    },
    rotationCenterX: {
      type: Number,
      default: 240,
    },
    rotationCenterY: {
      type: Number,
      default: 180,
    },
    thumbnailUrl: {
      type: String,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 索引优化
backdropSchema.index({ name: 1 });
backdropSchema.index({ tags: 1 });
backdropSchema.index({ isOfficial: 1 });
backdropSchema.index({ createdAt: -1 });

export default mongoose.model<IBackdrop>('Backdrop', backdropSchema);
