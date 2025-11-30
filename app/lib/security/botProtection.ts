/**
 * Bot protection and CAPTCHA implementation
 */

interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
}

class BotDetector {
  private suspiciousPatterns: RegExp[];
  private minInteractionTime: number;
  private maxTypingSpeed: number;

  constructor() {
    this.suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /automated/i,
      /headless/i
    ];
    this.minInteractionTime = 2000; // 2 seconds minimum interaction
    this.maxTypingSpeed = 10; // characters per second
  }

  analyzeUserAgent(userAgent: string): { suspicious: boolean; score: number } {
    let suspicionScore = 0;
    
    // Check for bot keywords
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        suspicionScore += 0.8;
      }
    }

    // Check for missing common browser indicators
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome') && !userAgent.includes('Safari')) {
      suspicionScore += 0.5;
    }

    // Check for unusual user agent length
    if (userAgent.length < 20 || userAgent.length > 500) {
      suspicionScore += 0.3;
    }

    return {
      suspicious: suspicionScore > 0.5,
      score: Math.min(suspicionScore, 1.0)
    };
  }

  analyzeTypingPattern(
    startTime: number,
    endTime: number,
    textLength: number
  ): { suspicious: boolean; score: number } {
    const totalTime = endTime - startTime;
    const typingSpeed = textLength / (totalTime / 1000);

    let suspicionScore = 0;

    // Too fast typing (bot-like)
    if (typingSpeed > this.maxTypingSpeed) {
      suspicionScore += 0.7;
    }

    // Too short interaction time
    if (totalTime < this.minInteractionTime) {
      suspicionScore += 0.6;
    }

    // Uniform typing speed (no human variance)
    if (typingSpeed > 5 && totalTime < 5000) {
      suspicionScore += 0.4;
    }

    return {
      suspicious: suspicionScore > 0.5,
      score: Math.min(suspicionScore, 1.0)
    };
  }

  analyzeMouseMovement(movements: { x: number; y: number; timestamp: number }[]): { suspicious: boolean; score: number } {
    if (movements.length === 0) {
      return { suspicious: true, score: 0.9 };
    }

    let suspicionScore = 0;

    // Check for too few movements
    if (movements.length < 3) {
      suspicionScore += 0.6;
    }

    // Check for perfect straight lines (bot-like)
    let straightLineCount = 0;
    for (let i = 2; i < movements.length; i++) {
      const prev = movements[i - 1];
      const curr = movements[i];
      const next = movements[i + 1];

      if (next) {
        const slope1 = (curr.y - prev.y) / (curr.x - prev.x || 1);
        const slope2 = (next.y - curr.y) / (next.x - curr.x || 1);
        
        if (Math.abs(slope1 - slope2) < 0.1) {
          straightLineCount++;
        }
      }
    }

    if (straightLineCount / movements.length > 0.7) {
      suspicionScore += 0.5;
    }

    return {
      suspicious: suspicionScore > 0.5,
      score: Math.min(suspicionScore, 1.0)
    };
  }

  detectBot(
    userAgent: string,
    startTime: number,
    endTime: number,
    textLength: number,
    mouseMovements: { x: number; y: number; timestamp: number }[] = []
  ): BotDetectionResult {
    const reasons: string[] = [];
    let totalScore = 0;

    // Analyze user agent
    const uaResult = this.analyzeUserAgent(userAgent);
    if (uaResult.suspicious) {
      reasons.push('Suspicious user agent detected');
      totalScore += uaResult.score * 0.4;
    }

    // Analyze typing pattern
    const typingResult = this.analyzeTypingPattern(startTime, endTime, textLength);
    if (typingResult.suspicious) {
      reasons.push('Unnatural typing pattern detected');
      totalScore += typingResult.score * 0.3;
    }

    // Analyze mouse movement
    const mouseResult = this.analyzeMouseMovement(mouseMovements);
    if (mouseResult.suspicious) {
      reasons.push('Suspicious mouse movement pattern');
      totalScore += mouseResult.score * 0.3;
    }

    const confidence = Math.min(totalScore, 1.0);
    const isBot = confidence > 0.6;

    return {
      isBot,
      confidence,
      reasons: isBot ? reasons : []
    };
  }
}

// Honeypot trap
export class HoneypotTrap {
  private static readonly HONEYPOT_FIELD = 'website_url';
  
  static createHoneypot(): { fieldName: string; fieldId: string } {
    return {
      fieldName: this.HONEYPOT_FIELD,
      fieldId: 'honeypot_' + Math.random().toString(36).substr(2, 9)
    };
  }

  static isTrapped(formData: Record<string, any>): boolean {
    return formData[this.HONEYPOT_FIELD] && formData[this.HONEYPOT_FIELD].trim() !== '';
  }
}

// Simple CAPTCHA challenge
export class SimpleCaptcha {
  private static challenges = [
    { question: "What is 5 + 3?", answer: "8" },
    { question: "What comes after 2 in counting?", answer: "3" },
    { question: "How many sides does a triangle have?", answer: "3" },
    { question: "What is 10 - 7?", answer: "3" },
    { question: "What is the first letter of the alphabet?", answer: "a" }
  ];

  static generateChallenge(): { id: string; question: string } {
    const challenge = this.challenges[Math.floor(Math.random() * this.challenges.length)];
    const id = Math.random().toString(36).substr(2, 9);
    
    // Store challenge in session storage for verification
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`captcha_${id}`, challenge.answer);
    }
    
    return { id, question: challenge.question };
  }

  static verifyCaptcha(id: string, answer: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const correctAnswer = sessionStorage.getItem(`captcha_${id}`);
    sessionStorage.removeItem(`captcha_${id}`);
    
    return correctAnswer?.toLowerCase() === answer.toLowerCase().trim();
  }
}

export const botDetector = new BotDetector();