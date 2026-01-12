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
}
