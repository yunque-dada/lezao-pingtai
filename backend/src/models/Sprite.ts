import mongoose, { Document, Schema } from 'mongoose';

export interface ICostume {
  assetId: string;
  name: string;
  bitmapResolution: number;
  md5ext: string;
  dataFormat: string;
  rotationCenterX: number;
  rotationCenterY: number;
}

export interface ISound {
  assetId: string;
  name: string;
  dataFormat: string;
  format?: string;
  rate: number;
  sampleCount: number;
  md5ext: string;
}

export interface ISprite extends Document {
  name: string;
  tags: string[];
  isStage: boolean;
  costumes: ICostume[];
  sounds: ISound[];
  blocks?: any;
  variables?: any;
  lists?: any;
  broadcasts?: any;
  thumbnailUrl?: string;
  downloadCount: number;
  createdBy?: mongoose.Types.ObjectId;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const costumeSchema: Schema = new Schema({
  assetId: { type: String, required: true },
  name: { type: String, required: true },
  bitmapResolution: { type: Number, default: 1 },
  md5ext: { type: String, required: true },
  dataFormat: { type: String, required: true },
  rotationCenterX: { type: Number, required: true },
  rotationCenterY: { type: Number, required: true },
});

const soundSchema: Schema = new Schema({
  assetId: { type: String, required: true },
  name: { type: String, required: true },
  dataFormat: { type: String, required: true },
  format: { type: String, default: '' },
  rate: { type: Number, required: true },
  sampleCount: { type: Number, required: true },
  md5ext: { type: String, required: true },
});

const spriteSchema: Schema = new Schema(
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
    isStage: {
      type: Boolean,
      default: false,
    },
    costumes: [costumeSchema],
    sounds: [soundSchema],
    blocks: {
      type: Schema.Types.Mixed,
      default: {},
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lists: {
      type: Schema.Types.Mixed,
      default: {},
    },
    broadcasts: {
      type: Schema.Types.Mixed,
      default: {},
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
spriteSchema.index({ name: 1 });
spriteSchema.index({ tags: 1 });
spriteSchema.index({ isOfficial: 1 });
spriteSchema.index({ createdAt: -1 });

export default mongoose.model<ISprite>('Sprite', spriteSchema);
