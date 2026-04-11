import { VisitorRepository } from '../repositories/visitorRepository';
// import { IVisitor } from '../models/visitor';
import crypto from 'crypto';
import NodeCache from 'node-cache';

const visitorCache = new NodeCache({ stdTTL: 600 }); // 10 minutes cache
const CACHE_KEY = 'visitorCounts';

export class VisitorService {
  private visitorRepository: VisitorRepository;

  constructor() {
    this.visitorRepository = new VisitorRepository();
  }

  /**
   * Generate a unique visitor ID based on IP and User-Agent
   */
  private generateVisitorId(ipAddress: string, userAgent: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${ipAddress}-${userAgent}`)
      .digest('hex');
    return hash.substring(0, 32);
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(req: any): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Track a visitor visit
   */
  async trackVisit(req: any): Promise<{ isNewVisitor: boolean; uniqueVisitors: number; totalVisits: number }> {
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const visitorId = this.generateVisitorId(ipAddress, userAgent);

    // Check if visitor exists
    let visitor = await this.visitorRepository.findById(visitorId);
    let isNewVisitor = false;

    if (!visitor) {
      // New visitor
      visitor = await this.visitorRepository.create({
        visitorId,
        ipAddress,
        userAgent,
        lastVisit: new Date(),
        visitCount: 1,
      });
      isNewVisitor = true;
    } else {
      // Update existing visitor
      const timeSinceLastVisit = Date.now() - visitor.lastVisit.getTime();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      // Only update if last visit was more than 1 hour ago (to avoid spam)
      if (timeSinceLastVisit > oneHour) {
        await this.visitorRepository.update(visitorId, {
          lastVisit: new Date(),
          visitCount: visitor.visitCount + 1,
        });
      }
    }

    // Get counts from cache or DB
    let counts = visitorCache.get<{ uniqueVisitors: number; totalVisits: number }>(CACHE_KEY);
    if (!counts) {
      const [unique, total] = await Promise.all([
        this.visitorRepository.getUniqueVisitorCount(),
        this.visitorRepository.getTotalVisitsCount(),
      ]);
      counts = { uniqueVisitors: unique, totalVisits: total };
      visitorCache.set(CACHE_KEY, counts);
    } else {
      // Increment cache if memory is already set, preventing DB hit
      if (isNewVisitor) {
        counts.uniqueVisitors += 1;
        counts.totalVisits += 1;
        visitorCache.set(CACHE_KEY, counts);
      } else if (visitor) {
        const timeSinceLastVisit = Date.now() - visitor.lastVisit.getTime();
        const oneHour = 60 * 60 * 1000;
        if (timeSinceLastVisit > oneHour) {
          counts.totalVisits += 1;
          visitorCache.set(CACHE_KEY, counts);
        }
      }
    }

    return {
      isNewVisitor,
      uniqueVisitors: counts.uniqueVisitors,
      totalVisits: counts.totalVisits,
    };
  }

  /**
   * Get visitor counts (unique visitors and total visits)
   */
  async getVisitorCounts(): Promise<{ uniqueVisitors: number; totalVisits: number }> {
    let counts = visitorCache.get<{ uniqueVisitors: number; totalVisits: number }>(CACHE_KEY);
    
    if (!counts) {
      const [unique, total] = await Promise.all([
        this.visitorRepository.getUniqueVisitorCount(),
        this.visitorRepository.getTotalVisitsCount(),
      ]);
      counts = { uniqueVisitors: unique, totalVisits: total };
      visitorCache.set(CACHE_KEY, counts);
    }

    return counts;
  }

  /**
   * Get all visitors with pagination and sorting
   */
  async getAllVisitors(
    page: number = 1,
    limit: number = 25,
    sortBy: string = 'lastVisit',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ visitors: any[]; total: number; totalPages: number; currentPage: number }> {
    const { visitors, total } = await this.visitorRepository.findAll(page, limit, sortBy, sortOrder);
    const totalPages = Math.ceil(total / limit);
    
    return {
      visitors,
      total,
      totalPages,
      currentPage: page,
    };
  }
}
