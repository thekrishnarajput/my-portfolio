import HomepageConfig, { IHomepageConfig } from '../models/homepageConfig';

export class HomepageConfigRepository {
  async findActive(): Promise<IHomepageConfig | null> {
    return HomepageConfig.findOne({ isActive: true }).lean().exec() as unknown as IHomepageConfig | null;
  }

  async findById(id: string): Promise<IHomepageConfig | null> {
    return HomepageConfig.findById(id).lean().exec() as unknown as IHomepageConfig | null;
  }

  async findAll(): Promise<IHomepageConfig[]> {
    return HomepageConfig.find().sort({ createdAt: -1 }).lean().exec() as unknown as IHomepageConfig[];
  }

  async create(data: Partial<IHomepageConfig>): Promise<IHomepageConfig> {
    // If this is set to active, deactivate all others
    if (data.isActive) {
      await HomepageConfig.updateMany({ isActive: true }, { isActive: false }).exec();
    }
    const config = new HomepageConfig(data);
    return config.save();
  }

  async update(id: string, data: Partial<IHomepageConfig>): Promise<IHomepageConfig | null> {
    // If this is set to active, deactivate all others
    if (data.isActive) {
      await HomepageConfig.updateMany(
        { isActive: true, _id: { $ne: id } },
        { isActive: false }
      ).exec();
    }
    return HomepageConfig.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<IHomepageConfig | null> {
    return HomepageConfig.findByIdAndDelete(id).exec();
  }

  async setActive(id: string): Promise<IHomepageConfig | null> {
    // Deactivate all others first
    await HomepageConfig.updateMany({ isActive: true }, { isActive: false }).exec();
    // Activate this one
    return HomepageConfig.findByIdAndUpdate(id, { isActive: true }, { new: true }).exec();
  }
}
