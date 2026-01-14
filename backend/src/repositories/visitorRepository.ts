import Visitor, { IVisitor } from '../models/visitor';

export class VisitorRepository {
  async findById(visitorId: string): Promise<IVisitor | null> {
    return Visitor.findOne({ visitorId }).exec();
  }

  async create(data: Partial<IVisitor>): Promise<IVisitor> {
    const visitor = new Visitor(data);
    return visitor.save();
  }

  async update(visitorId: string, data: Partial<IVisitor>): Promise<IVisitor | null> {
    return Visitor.findOneAndUpdate(
      { visitorId },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async getTotalVisitorCount(): Promise<number> {
    return Visitor.countDocuments().exec();
  }

  async getUniqueVisitorCount(): Promise<number> {
    return Visitor.countDocuments().exec();
  }

  async findAll(
    page: number = 1,
    limit: number = 25,
    sortBy: string = 'lastVisit',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ visitors: IVisitor[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Validate sortBy field
    const allowedSortFields = ['visitorId', 'ipAddress', 'lastVisit', 'visitCount', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'lastVisit';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    const sortObject: any = {};
    sortObject[sortField] = sortDirection;
    
    const [visitors, total] = await Promise.all([
      Visitor.find()
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .exec(),
      Visitor.countDocuments().exec(),
    ]);
    return { visitors, total };
  }
}
