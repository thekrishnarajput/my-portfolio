import { SkillRepository } from '../repositories/skillRepository';
import { ISkill } from '../models/Skill';

export class SkillService {
    private skillRepository: SkillRepository;

    constructor() {
        this.skillRepository = new SkillRepository();
    }

    async getAllSkills(): Promise<ISkill[]> {
        return this.skillRepository.findAll();
    }

    async getSkillById(id: string): Promise<ISkill | null> {
        return this.skillRepository.findById(id);
    }

    async createSkill(data: Partial<ISkill>): Promise<ISkill> {
        return this.skillRepository.create(data);
    }

    async updateSkill(id: string, data: Partial<ISkill>): Promise<ISkill | null> {
        return this.skillRepository.update(id, data);
    }

    async deleteSkill(id: string): Promise<ISkill | null> {
        return this.skillRepository.delete(id);
    }
}

