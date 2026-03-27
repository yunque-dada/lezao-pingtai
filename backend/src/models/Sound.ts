import mongoose, { Document, Schema } from 'mongoose';

export interface ISound extends Document {
  name: string;
  tags: string[];
  assetId: string;
  dataFormat: string;
  format?: string;
  rate: number;
  sampleCount: number;
  md5ext: string;
  duration?: number;
  thumbnailUrl?: string;
  downloadCount: number;
  createdBy?: mongoose.Types.ObjectId;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const soundSchema: Schema = new Schema(
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
    dataFormat: {
      type: String,
      required: true,
      default: 'wav',
    },
    format: {
      type: String,
      default: '',
    },
    rate: {
      type: Number,
      required: true,
      default: 44100,
    },
    sampleCount: {
      type: Number,
      required: true,
    },
    md5ext: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
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
soundSchema.index({ name: 1 });
soundSchema.index({ tags: 1 });
soundSchema.index({ isOfficial: 1 });
soundSchema.index({ createdAt: -1 });

export default mongoose.model<ISound>('Sound', soundSchema);
