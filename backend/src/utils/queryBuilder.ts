import mongoose, { Document, Model, Query, PopulateOptions } from 'mongoose';

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class QueryBuilder<T extends Document> {
  private query: Query<T[], T>;
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
    this.query = model.find();
  }

  filter(filter: Record<string, any>): this {
    const queryObj = { ...filter };
    
    const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludeFields.forEach(field => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin|regex)\b/g, match => `$${match}`);
    
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields: string[], searchTerm?: string): this {
    if (searchTerm && fields.length > 0) {
      const searchRegex = new RegExp(searchTerm, 'i');
      const searchConditions = fields.map(field => ({
        [field]: searchRegex,
      }));
      this.query = this.query.or(searchConditions);
    }
    return this;
  }

  sort(sortBy?: string): this {
    if (sortBy) {
      const sortFields = sortBy.split(',').join(' ');
      this.query = this.query.sort(sortFields);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  select(fields?: string): this {
    if (fields) {
      const selectFields = fields.split(',').join(' ');
      this.query = this.query.select(selectFields);
    }
    return this;
  }

  populate(populateOptions: string | string[] | PopulateOptions | PopulateOptions[]): this {
    if (Array.isArray(populateOptions)) {
      populateOptions.forEach(option => {
        if (typeof option === 'string') {
          this.query = this.query.populate(option);
        } else {
          this.query = this.query.populate(option as PopulateOptions);
        }
      });
    } else if (typeof populateOptions === 'string') {
      this.query = this.query.populate(populateOptions);
    } else {
      this.query = this.query.populate(populateOptions as PopulateOptions);
    }
    return this;
  }

  async paginate(page: number = 1, limit: number = 10): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.query.skip(skip).limit(limit).exec(),
      this.model.countDocuments(this.query.getFilter()),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async exec(): Promise<T[]> {
    return this.query.exec();
  }

  async findOne(): Promise<T | null> {
    return this.query.findOne().exec();
  }
}

export const createQueryBuilder = <T extends Document>(model: Model<T>): QueryBuilder<T> => {
  return new QueryBuilder<T>(model);
};

export const leanQuery = async <T extends Document>(
  query: Query<T[], T>
): Promise<any[]> => {
  return query.lean().exec();
};

export const bulkWrite = async <T extends Document>(
  model: Model<T>,
  operations: any[]
): Promise<any> => {
  return model.bulkWrite(operations);
};

export const transaction = async <T>(
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
