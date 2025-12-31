/**
 * IP detection and geolocation services
 */

interface IPInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  isVpn?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  reputation: number; // 0-100, higher is better
}

interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

class IPDetectionService {
  private cache: Map<string, { data: IPInfo; timestamp: number }> = new Map();
  private cacheTimeout: number = 60 * 60 * 1000; // 1 hour
  private vpnIndicators: Set<string>;
  private maliciousRanges: { start: string; end: string; reason: string }[];

  constructor() {
    // Common VPN/Proxy indicators in user agents or headers
    this.vpnIndicators = new Set([
      'vpn',
      'proxy',
      'tor',
      'anonymizer',
      'hide',
      'mask',
      'tunnel'
    ]);

    // Known malicious IP ranges (simplified examples)
    this.maliciousRanges = [
      { start: '192.168.0.0', end: '192.168.255.255', reason: 'Private network' },
      { start: '10.0.0.0', end: '10.255.255.255', reason: 'Private network' },
      { start: '172.16.0.0', end: '172.31.255.255', reason: 'Private network' }
    ];
  }

  // Get client IP from various sources
  getClientIP(request?: any): string {
    if (typeof window !== 'undefined') {
      // Client-side detection (limited accuracy)
      return this.detectClientSideIP();
    }

    // Server-side IP detection
    if (request) {
      return this.extractServerSideIP(request);
    }

    return '127.0.0.1'; // Fallback
  }

  private detectClientSideIP(): string {
    // Note: Client-side IP detection is very limited due to privacy restrictions
    // This is a placeholder - real implementation would need WebRTC or external service
    
    // Try to get IP from WebRTC (if available and allowed)
    if (this.isWebRTCAvailable()) {
      return this.getIPFromWebRTC();
    }

    // Fallback to external service call
    return 'unknown';
  }

  private isWebRTCAvailable(): boolean {
    return !!(window as any).RTCPeerConnection || !!(window as any).webkitRTCPeerConnection;
  }

  private getIPFromWebRTC(): string {
    // WebRTC IP detection (simplified)
    // Note: This may not work in all browsers due to security restrictions
    try {
      const RTCPeerConnection = (window as any).RTCPeerConnection || (window as any).webkitRTCPeerConnection;
      const pc = new RTCPeerConnection({ iceServers: [] });
      
      pc.createDataChannel('');
      pc.createOffer().then((offer: any) => pc.setLocalDescription(offer));
      
      // This is simplified - real implementation would handle the ICE candidates
      return 'webrtc-detected';
    } catch (error) {
      console.warn('WebRTC IP detection failed:', error);
      return 'webrtc-failed';
    }
  }

  private extractServerSideIP(request: any): string {
    // Extract IP from various headers (Next.js/Express style)
    const headers = request.headers || {};
    
    // Check forwarded headers (common with proxies/load balancers)
    const forwarded = headers['x-forwarded-for'] || 
                     headers['x-real-ip'] || 
                     headers['x-client-ip'] || 
                     headers['cf-connecting-ip'] || // Cloudflare
                     headers['x-forwarded'] ||
                     headers['forwarded-for'] ||
                     headers['forwarded'];

    if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const ip = forwarded.split(',')[0].trim();
      if (this.isValidIP(ip)) {
        return ip;
      }
    }

    // Fallback to connection remote address
    return request.connection?.remoteAddress || 
           request.socket?.remoteAddress || 
           request.ip || 
           '127.0.0.1';
  }

  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  async analyzeIP(ip: string, userAgent?: string): Promise<IPInfo> {
    // Check cache first
    const cached = this.cache.get(ip);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const ipInfo: IPInfo = {
      ip,
      threatLevel: 'low',
      reputation: 70 // Default reputation
    };

    // Basic IP analysis
    ipInfo.threatLevel = this.analyzeIPReputation(ip);
    ipInfo.reputation = this.calculateIPReputation(ip);

    // Check for VPN/Proxy indicators
    if (userAgent) {
      const vpnDetection = this.detectVPN(ip, userAgent);
      ipInfo.isVpn = vpnDetection.isVpn;
      ipInfo.isProxy = vpnDetection.isProxy;
      ipInfo.isTor = vpnDetection.isTor;
      
      if (vpnDetection.isVpn || vpnDetection.isProxy) {
        ipInfo.reputation -= 20;
        ipInfo.threatLevel = ipInfo.threatLevel === 'low' ? 'medium' : ipInfo.threatLevel;
      }
    }

    // Get geolocation (simplified mock)
    try {
      const geoData = await this.getGeolocation(ip);
      Object.assign(ipInfo, geoData);
    } catch (error) {
      console.warn('Geolocation failed for IP:', ip, error);
    }

    // Cache the result
    this.cache.set(ip, { data: ipInfo, timestamp: Date.now() });

    return ipInfo;
  }

  private analyzeIPReputation(ip: string): 'low' | 'medium' | 'high' {
    // Check against known malicious ranges
    for (const range of this.maliciousRanges) {
      if (this.isIPInRange(ip, range.start, range.end)) {
        return 'high';
      }
    }

    // Check for private/local IPs
    if (this.isPrivateIP(ip)) {
      return 'medium';
    }

    // Additional checks would go here (blacklists, etc.)
    return 'low';
  }

  private calculateIPReputation(ip: string): number {
    let reputation = 80; // Base reputation

    // Reduce reputation for private IPs
    if (this.isPrivateIP(ip)) {
      reputation -= 20;
    }

    // Check IP structure patterns
    const parts = ip.split('.');
    if (parts.length === 4) {
      // Penalize IPs that look like hosting/cloud providers
      if (parts[0] === '54' || parts[0] === '52') { // AWS-like ranges
        reputation -= 10;
      }
    }

    return Math.max(0, Math.min(100, reputation));
  }

  private detectVPN(ip: string, userAgent: string): { isVpn: boolean; isProxy: boolean; isTor: boolean } {
    const userAgentLower = userAgent.toLowerCase();
    
    // Check user agent for VPN indicators
    const hasVpnIndicator = Array.from(this.vpnIndicators).some(indicator => 
      userAgentLower.includes(indicator)
    );

    // Simple heuristics (real implementation would use specialized services)
    const isVpn = hasVpnIndicator || this.isCommonVpnIP(ip);
    const isProxy = this.isCommonProxyIP(ip);
    const isTor = this.isCommonTorIP(ip);

    return { isVpn, isProxy, isTor };
  }

  private isCommonVpnIP(ip: string): boolean {
    // Simplified VPN detection based on common patterns
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    // Some hosting providers commonly used by VPNs
    const firstOctet = parseInt(parts[0]);
    const secondOctet = parseInt(parts[1]);

    // DigitalOcean ranges (often used for VPNs)
    if (firstOctet === 104 && secondOctet >= 248 && secondOctet <= 255) return true;
    
    // Vultr ranges
    if (firstOctet === 149 && secondOctet === 248) return true;

    return false;
  }

  private isCommonProxyIP(ip: string): boolean {
    // Simplified proxy detection
    // Real implementation would check against proxy databases
    return this.isCommonVpnIP(ip); // Overlaps with VPN detection
  }

  private isCommonTorIP(ip: string): boolean {
    // Simplified Tor detection
    // Real implementation would check against Tor exit node lists
    return false; // Placeholder
  }

  private async getGeolocation(ip: string): Promise<Partial<IPInfo>> {
    // Mock geolocation data
    // Real implementation would use services like MaxMind, ipapi.co, etc.
    
    const mockGeoData = {
      country: this.getMockCountry(ip),
      region: 'Unknown Region',
      city: 'Unknown City',
      isp: 'Unknown ISP'
    };

    return mockGeoData;
  }

  private getMockCountry(ip: string): string {
    const parts = ip.split('.');
    if (parts.length !== 4) return 'Unknown';

    const firstOctet = parseInt(parts[0]);
    
    // Mock country assignment based on IP ranges
    if (firstOctet >= 1 && firstOctet <= 63) return 'United States';
    if (firstOctet >= 64 && firstOctet <= 95) return 'Europe';
    if (firstOctet >= 96 && firstOctet <= 127) return 'Asia';
    if (firstOctet >= 128 && firstOctet <= 191) return 'North America';
    
    return 'Other';
  }

  private isIPInRange(ip: string, startIP: string, endIP: string): boolean {
    // Simplified IP range check for IPv4
    const ipNum = this.ipToNumber(ip);
    const startNum = this.ipToNumber(startIP);
    const endNum = this.ipToNumber(endIP);
    
    return ipNum >= startNum && ipNum <= endNum;
  }

  private ipToNumber(ip: string): number {
    const parts = ip.split('.');
    return parts.reduce((acc, part, index) => {
      return acc + parseInt(part) * Math.pow(256, 3 - index);
    }, 0);
  }

  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      { start: '10.0.0.0', end: '10.255.255.255' },
      { start: '172.16.0.0', end: '172.31.255.255' },
      { start: '192.168.0.0', end: '192.168.255.255' },
      { start: '127.0.0.0', end: '127.255.255.255' }
    ];

    return privateRanges.some(range => 
      this.isIPInRange(ip, range.start, range.end)
    );
  }

  // Get threat level for multiple IPs
  async analyzeBulkIPs(ips: string[]): Promise<Map<string, IPInfo>> {
    const results = new Map<string, IPInfo>();
    
    // Process in batches to avoid overwhelming external services
    const batchSize = 10;
    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      const promises = batch.map(ip => this.analyzeIP(ip));
      const batchResults = await Promise.all(promises);
      
      batch.forEach((ip, index) => {
        results.set(ip, batchResults[index]);
      });
    }

    return results;
  }

  // Clean up cache periodically
  cleanup() {
    const cutoff = Date.now() - this.cacheTimeout;
    for (const [ip, data] of this.cache.entries()) {
      if (data.timestamp < cutoff) {
        this.cache.delete(ip);
      }
    }
  }
}

export const ipDetectionService = new IPDetectionService();

// Cleanup cache every hour
setInterval(() => {
  ipDetectionService.cleanup();
}, 60 * 60 * 1000);