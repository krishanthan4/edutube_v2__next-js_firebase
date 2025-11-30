/**
 * Real-time threat analysis and monitoring
 */

interface ThreatEvent {
  id: string;
  timestamp: number;
  type: 'login_attempt' | 'signup_attempt' | 'password_reset' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string; // IP address
  userAgent: string;
  email?: string;
  details: Record<string, any>;
}

interface ThreatScore {
  overall: number; // 0-100
  factors: {
    location: number;
    frequency: number;
    behavior: number;
    device: number;
  };
  risks: string[];
}

class ThreatAnalyzer {
  private eventHistory: Map<string, ThreatEvent[]> = new Map();
  private ipHistory: Map<string, ThreatEvent[]> = new Map();
  private maxHistoryAge: number = 24 * 60 * 60 * 1000; // 24 hours
  private maxEventsPerIp: number = 100;

  recordEvent(event: Omit<ThreatEvent, 'id' | 'timestamp'>) {
    const threatEvent: ThreatEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    // Store by email if available
    if (event.email) {
      const emailEvents = this.eventHistory.get(event.email) || [];
      emailEvents.push(threatEvent);
      this.eventHistory.set(event.email, emailEvents);
    }

    // Store by IP
    const ipEvents = this.ipHistory.get(event.source) || [];
    ipEvents.push(threatEvent);
    
    // Limit events per IP to prevent memory issues
    if (ipEvents.length > this.maxEventsPerIp) {
      ipEvents.shift();
    }
    
    this.ipHistory.set(event.source, ipEvents);

    this.cleanup();
  }

  analyzeThreat(
    email: string,
    ipAddress: string,
    userAgent: string,
    eventType: ThreatEvent['type']
  ): ThreatScore {
    const risks: string[] = [];
    const factors = { location: 0, frequency: 0, behavior: 0, device: 0 };

    // Analyze frequency patterns
    const ipEvents = this.getRecentEvents(ipAddress, 'ip');
    const emailEvents = this.getRecentEvents(email, 'email');

    // IP frequency analysis
    const recentIpEvents = ipEvents.filter(e => Date.now() - e.timestamp < 60 * 60 * 1000); // Last hour
    if (recentIpEvents.length > 10) {
      factors.frequency += 40;
      risks.push('High frequency of requests from IP address');
    } else if (recentIpEvents.length > 5) {
      factors.frequency += 20;
      risks.push('Moderate frequency of requests from IP address');
    }

    // Email frequency analysis
    const recentEmailEvents = emailEvents.filter(e => Date.now() - e.timestamp < 60 * 60 * 1000);
    if (recentEmailEvents.length > 5) {
      factors.frequency += 30;
      risks.push('Multiple attempts for this email');
    }

    // Failed attempts analysis
    const failedAttempts = ipEvents.filter(e => 
      e.type === 'login_attempt' && 
      e.severity === 'medium' &&
      Date.now() - e.timestamp < 60 * 60 * 1000
    );
    
    if (failedAttempts.length > 3) {
      factors.behavior += 50;
      risks.push('Multiple failed authentication attempts');
    }

    // Geographic analysis (simplified - would need GeoIP service)
    const uniqueCountries = this.analyzeGeographicPattern(ipAddress);
    if (uniqueCountries > 3) {
      factors.location += 30;
      risks.push('Requests from multiple geographic locations');
    }

    // Device fingerprint analysis
    const deviceScore = this.analyzeDeviceFingerprint(userAgent, ipEvents);
    factors.device = deviceScore;
    if (deviceScore > 30) {
      risks.push('Suspicious device characteristics detected');
    }

    // Time pattern analysis
    const timeScore = this.analyzeTimePatterns(ipEvents);
    factors.behavior += timeScore;
    if (timeScore > 25) {
      risks.push('Unusual access time patterns');
    }

    // Calculate overall threat score
    const overall = Math.min(
      (factors.location + factors.frequency + factors.behavior + factors.device) / 4,
      100
    );

    return {
      overall,
      factors,
      risks
    };
  }

  private getRecentEvents(identifier: string, type: 'ip' | 'email'): ThreatEvent[] {
    const events = type === 'ip' 
      ? this.ipHistory.get(identifier) || []
      : this.eventHistory.get(identifier) || [];
    
    const cutoff = Date.now() - this.maxHistoryAge;
    return events.filter(event => event.timestamp > cutoff);
  }

  private analyzeGeographicPattern(ipAddress: string): number {
    // In a real implementation, you would use a GeoIP service
    // This is a simplified simulation
    const ipParts = ipAddress.split('.');
    const firstOctet = parseInt(ipParts[0]);
    
    // Simulate different "countries" based on IP ranges
    if (firstOctet >= 1 && firstOctet <= 50) return 1; // "Country A"
    if (firstOctet >= 51 && firstOctet <= 100) return 2; // "Country B"
    if (firstOctet >= 101 && firstOctet <= 150) return 3; // "Country C"
    return 4; // "Other countries"
  }

  private analyzeDeviceFingerprint(userAgent: string, events: ThreatEvent[]): number {
    let suspicionScore = 0;

    // Check for user agent switching
    const recentUserAgents = new Set(
      events
        .filter(e => Date.now() - e.timestamp < 60 * 60 * 1000)
        .map(e => e.userAgent)
    );
    
    if (recentUserAgents.size > 3) {
      suspicionScore += 40;
    }

    // Check for automation indicators
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('automation')) {
      suspicionScore += 60;
    }

    // Check for missing standard browser indicators
    if (!userAgent.includes('Mozilla') && !userAgent.includes('WebKit')) {
      suspicionScore += 30;
    }

    return Math.min(suspicionScore, 100);
  }

  private analyzeTimePatterns(events: ThreatEvent[]): number {
    if (events.length < 3) return 0;

    const recentEvents = events
      .filter(e => Date.now() - e.timestamp < 60 * 60 * 1000)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (recentEvents.length < 3) return 0;

    // Check for very regular intervals (bot-like behavior)
    const intervals: number[] = [];
    for (let i = 1; i < recentEvents.length; i++) {
      intervals.push(recentEvents[i].timestamp - recentEvents[i - 1].timestamp);
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Low variance suggests automated behavior
    const coefficientOfVariation = standardDeviation / avgInterval;
    if (coefficientOfVariation < 0.1) {
      return 40; // Very regular intervals
    } else if (coefficientOfVariation < 0.3) {
      return 20; // Somewhat regular intervals
    }

    return 0;
  }

  getIpThreatLevel(ipAddress: string): 'low' | 'medium' | 'high' {
    const events = this.getRecentEvents(ipAddress, 'ip');
    const score = this.analyzeThreat('', ipAddress, '', 'login_attempt').overall;

    if (score > 70) return 'high';
    if (score > 40) return 'medium';
    return 'low';
  }

  shouldBlockIp(ipAddress: string): boolean {
    return this.getIpThreatLevel(ipAddress) === 'high';
  }

  private cleanup() {
    const cutoff = Date.now() - this.maxHistoryAge;

    // Cleanup email history
    for (const [email, events] of this.eventHistory.entries()) {
      const recentEvents = events.filter(event => event.timestamp > cutoff);
      if (recentEvents.length === 0) {
        this.eventHistory.delete(email);
      } else {
        this.eventHistory.set(email, recentEvents);
      }
    }

    // Cleanup IP history
    for (const [ip, events] of this.ipHistory.entries()) {
      const recentEvents = events.filter(event => event.timestamp > cutoff);
      if (recentEvents.length === 0) {
        this.ipHistory.delete(ip);
      } else {
        this.ipHistory.set(ip, recentEvents);
      }
    }
  }

  // Get threat statistics
  getThreatStats(): {
    totalEvents: number;
    uniqueIps: number;
    highRiskIps: number;
    recentEvents: number;
  } {
    let totalEvents = 0;
    const uniqueIps = this.ipHistory.size;
    let highRiskIps = 0;
    let recentEvents = 0;

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [ip, events] of this.ipHistory.entries()) {
      totalEvents += events.length;
      
      if (this.getIpThreatLevel(ip) === 'high') {
        highRiskIps++;
      }

      recentEvents += events.filter(e => e.timestamp > oneHourAgo).length;
    }

    return {
      totalEvents,
      uniqueIps,
      highRiskIps,
      recentEvents
    };
  }
}

export const threatAnalyzer = new ThreatAnalyzer();