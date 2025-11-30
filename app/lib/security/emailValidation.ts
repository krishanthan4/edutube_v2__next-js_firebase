/**
 * Email validation and verification utilities
 */

import { sendEmailVerification } from 'firebase/auth';

interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-1, higher is better
}

interface DisposableEmailProvider {
  domain: string;
  blocked: boolean;
}

class EmailValidator {
  private disposableProviders: Set<string>;
  private suspiciousTlds: Set<string>;

  constructor() {
    // Common disposable email providers
    this.disposableProviders = new Set([
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'yopmail.com',
      '33mail.com',
      'throwaway.email',
      'getnada.com',
      'temp-mail.org',
      'mohmal.com',
      'emailondeck.com',
      'tempail.com',
      'dispostable.com',
      'throwawaymail.com'
    ]);

    // Suspicious TLDs often used for spam
    this.suspiciousTlds = new Set([
      'tk',
      'ml',
      'ga',
      'cf',
      'top',
      'click',
      'download'
    ]);
  }

  validateEmail(email: string): EmailValidationResult {
    const errors: string[] = [];
    let score = 1.0;

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
      score -= 0.8;
    }

    // Length check
    if (email.length > 254) {
      errors.push('Email address too long');
      score -= 0.3;
    }

    // Local part checks
    const [localPart, domain] = email.split('@');
    if (localPart) {
      // Local part length
      if (localPart.length > 64) {
        errors.push('Email username too long');
        score -= 0.2;
      }

      // Suspicious patterns in local part
      if (/^\d+$/.test(localPart)) {
        errors.push('Email username is only numbers');
        score -= 0.3;
      }

      // Multiple consecutive dots
      if (localPart.includes('..')) {
        errors.push('Invalid characters in email');
        score -= 0.4;
      }

      // Suspicious characters
      if (/[<>()[\]\\.,;:\s@"]/.test(localPart.replace(/"/g, ''))) {
        errors.push('Email contains invalid characters');
        score -= 0.4;
      }
    }

    // Domain checks
    if (domain) {
      const domainLower = domain.toLowerCase();
      
      // Check for disposable email providers
      if (this.disposableProviders.has(domainLower)) {
        errors.push('Disposable email addresses are not allowed');
        score -= 0.9;
      }

      // Check TLD
      const tld = domainLower.split('.').pop();
      if (tld && this.suspiciousTlds.has(tld)) {
        errors.push('Email domain appears suspicious');
        score -= 0.3;
      }

      // Domain length check
      if (domain.length > 253) {
        errors.push('Email domain too long');
        score -= 0.3;
      }

      // Check for valid TLD
      if (!tld || tld.length < 2) {
        errors.push('Invalid email domain');
        score -= 0.5;
      }
    }

    score = Math.max(0, score);

    return {
      isValid: errors.length === 0 && score > 0.5,
      errors,
      score
    };
  }

  // Advanced email validation using DNS (would need backend implementation)
  async validateEmailAdvanced(email: string): Promise<EmailValidationResult> {
    const basicValidation = this.validateEmail(email);
    
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // In a real implementation, you would:
    // 1. Check MX records
    // 2. Validate SMTP server
    // 3. Check against known spam lists
    // 4. Verify with email verification service

    return basicValidation;
  }

  isDomainBlacklisted(domain: string): boolean {
    return this.disposableProviders.has(domain.toLowerCase());
  }

  addDisposableDomain(domain: string) {
    this.disposableProviders.add(domain.toLowerCase());
  }

  removeDisposableDomain(domain: string) {
    this.disposableProviders.delete(domain.toLowerCase());
  }
}

// Email verification utilities
export class EmailVerificationService {
  static async sendVerification(user: any) {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await sendEmailVerification(user);
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static isEmailVerified(user: any): boolean {
    return user?.emailVerified === true;
  }

  static requireEmailVerification(user: any) {
    if (!this.isEmailVerified(user)) {
      throw new Error('Email verification required. Please check your inbox and verify your email address.');
    }
  }
}

// Email reputation scoring
export class EmailReputationService {
  private static trustedDomains = new Set([
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'icloud.com',
    'protonmail.com',
    'edu',
    'org',
    'gov'
  ]);

  static calculateReputationScore(email: string): number {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 0;

    let score = 0.5; // Base score

    // Trusted domains get higher score
    if (this.trustedDomains.has(domain) || domain.endsWith('.edu') || domain.endsWith('.gov')) {
      score += 0.4;
    }

    // Corporate domains (contain company indicators)
    if (domain.includes('corp') || domain.includes('company') || !domain.includes('.')) {
      score += 0.2;
    }

    // Age of domain (would need external service)
    // Premium domains (.com, .org, .net)
    if (domain.endsWith('.com') || domain.endsWith('.org') || domain.endsWith('.net')) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  static isTrustedDomain(domain: string): boolean {
    return this.trustedDomains.has(domain.toLowerCase());
  }
}

export const emailValidator = new EmailValidator();