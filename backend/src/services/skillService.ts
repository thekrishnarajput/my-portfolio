import { SkillRepository } from '../repositories/skillRepository';
import { ISkill } from '../models/skill';
import NodeCache from 'node-cache';

const skillCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
const SKILLS_KEY = 'allSkills';

export class SkillService {
    private skillRepository: SkillRepository;

    constructor() {
        this.skillRepository = new SkillRepository();
    }

    async getAllSkills(): Promise<ISkill[]> {
        let skills = skillCache.get<ISkill[]>(SKILLS_KEY);
        if (!skills) {
            skills = await this.skillRepository.findAll() as unknown as ISkill[];
            skillCache.set(SKILLS_KEY, skills);
        }
        return skills;
    }

    async getSkillById(id: string): Promise<ISkill | null> {
        return this.skillRepository.findById(id);
    }

    async createSkill(data: Partial<ISkill>): Promise<ISkill> {
        const skill = await this.skillRepository.create(data);
        skillCache.del(SKILLS_KEY);
        return skill;
    }

    async updateSkill(id: string, data: Partial<ISkill>): Promise<ISkill | null> {
        const skill = await this.skillRepository.update(id, data);
        skillCache.del(SKILLS_KEY);
        return skill;
    }

    async deleteSkill(id: string): Promise<ISkill | null> {
        const skill = await this.skillRepository.delete(id);
        skillCache.del(SKILLS_KEY);
        return skill;
    }
}

