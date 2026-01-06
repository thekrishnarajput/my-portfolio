import Skill, { ISkill } from '../models/skill';

export class SkillRepository {
    async findAll(): Promise<ISkill[]> {
        return Skill.find().sort({ category: 1, order: 1 }).exec();
    }

    async findById(id: string): Promise<ISkill | null> {
        return Skill.findById(id).exec();
    }

    async create(data: Partial<ISkill>): Promise<ISkill> {
        const skill = new Skill(data);
        return skill.save();
    }

    async update(id: string, data: Partial<ISkill>): Promise<ISkill | null> {
        return Skill.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    }

    async delete(id: string): Promise<ISkill | null> {
        return Skill.findByIdAndDelete(id).exec();
    }
}

