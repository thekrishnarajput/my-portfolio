import { VisitorRepository } from '../repositories/visitorRepository';
// import { IVisitor } from '../models/visitor';
import crypto from 'crypto';

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
  async trackVisit(req: any): Promise<{ isNewVisitor: boolean; totalCount: number }> {
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

    // Get total visitor count
    const totalCount = await this.visitorRepository.getTotalVisitorCount();

    return {
      isNewVisitor,
      totalCount,
    };
  }

  /**
   * Get total visitor count
   */
  async getTotalVisitorCount(): Promise<number> {
    return this.visitorRepository.getTotalVisitorCount();
  }
}
