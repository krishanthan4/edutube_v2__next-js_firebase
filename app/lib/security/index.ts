/**
 * Main security service that integrates all security measures
 */

import { loginRateLimit, signupRateLimit, passwordResetRateLimit } from './rateLimit';
import { botDetector, HoneypotTrap, SimpleCaptcha } from './botProtection';
import { emailValidator, EmailVerificationService, EmailReputationService } from './emailValidation';
import { threatAnalyzer } from './threatAnalysis';
import { ipDetectionService } from './ipDetection';

export interface SecurityCheckResult {
  allowed: boolean;
  confidence: number; // 0-1
  reasons: string[];
  actions?: string[];
  retryAfter?: number;
  requiresCaptcha?: boolean;
  requiresEmailVerification?: boolean;
}

export interface SecurityContext {
  email?: string;
  ip: string;
  userAgent: string;
  timestamp: number;
  action: 'login' | 'signup' | 'password_reset';
  formData?: Record<string, any>;
  interactionData?: {
    startTime: number;
    endTime: number;
    textLength: number;
    mouseMovements: { x: number; y: number; timestamp: number }[];
  };
}

class SecurityService {
  async performSecurityCheck(context: SecurityContext): Promise<SecurityCheckResult> {
    const results: SecurityCheckResult = {
      allowed: true,
      confidence: 1.0,
      reasons: [],
      actions: []
    };

    try {
      // 1. Rate Limiting Check
      const rateLimitResult = await this.checkRateLimit(context);
      if (!rateLimitResult.allowed) {
        return rateLimitResult;
      }

      // 2. Bot Detection
      const botResult = await this.checkBotProtection(context);
      if (!botResult.allowed) {
        return botResult;
      }

      // 3. Email Validation (if email provided)
      let emailResult: SecurityCheckResult = {
        allowed: true,
        confidence: 1.0,
        reasons: []
      };
      if (context.email) {
        emailResult = await this.validateEmail(context.email);
        if (!emailResult.allowed) {
          return emailResult;
        }
      }

      // 4. IP Threat Analysis
      const ipResult = await this.analyzeIP(context);
      if (!ipResult.allowed) {
        return ipResult;
      }

      // 5. Real-time Threat Analysis
      const threatResult = await this.analyzeThreat(context);
      if (!threatResult.allowed) {
        return threatResult;
      }

      // 6. Combined Risk Assessment
      const combinedResult = this.calculateCombinedRisk(context, [
        rateLimitResult,
        botResult,
        emailResult,
        ipResult,
        threatResult
      ]);

      // Record the security event
      await this.recordSecurityEvent(context, combinedResult);

      return combinedResult;

    } catch (error) {
      console.error('Security check failed:', error);
      
      // Fail securely - deny access on error
      return {
        allowed: false,
        confidence: 0,
        reasons: ['Security system temporarily unavailable'],
        actions: ['Please try again later']
      };
    }
  }

  private async checkRateLimit(context: SecurityContext): Promise<SecurityCheckResult> {
    const identifier = context.email || context.ip;
    let rateLimit;

    switch (context.action) {
      case 'login':
        rateLimit = loginRateLimit;
        break;
      case 'signup':
        rateLimit = signupRateLimit;
        break;
      case 'password_reset':
        rateLimit = passwordResetRateLimit;
        break;
      default:
        rateLimit = loginRateLimit;
    }

    const limitCheck = rateLimit.checkLimit(identifier);
    
    if (!limitCheck.allowed) {
      return {
        allowed: false,
        confidence: 1.0,
        reasons: ['Too many attempts'],
        actions: ['Please wait before trying again'],
        retryAfter: limitCheck.retryAfter
      };
    }

    return {
      allowed: true,
      confidence: 1.0,
      reasons: []
    };
  }

  private async checkBotProtection(context: SecurityContext): Promise<SecurityCheckResult> {
    const reasons: string[] = [];
    let confidence = 1.0;

    // Check honeypot if form data provided
    if (context.formData && HoneypotTrap.isTrapped(context.formData)) {
      return {
        allowed: false,
        confidence: 1.0,
        reasons: ['Bot detected via honeypot'],
        actions: ['Access denied']
      };
    }

    // Bot detection analysis
    if (context.interactionData) {
      const botResult = botDetector.detectBot(
        context.userAgent,
        context.interactionData.startTime,
        context.interactionData.endTime,
        context.interactionData.textLength,
        context.interactionData.mouseMovements
      );

      if (botResult.isBot) {
        return {
          allowed: false,
          confidence: botResult.confidence,
          reasons: botResult.reasons,
          actions: ['Complete CAPTCHA verification'],
          requiresCaptcha: true
        };
      }

      if (botResult.confidence > 0.3) {
        confidence -= botResult.confidence * 0.3;
        reasons.push('Suspicious interaction patterns detected');
      }
    }

    return {
      allowed: true,
      confidence: Math.max(confidence, 0.1),
      reasons
    };
  }

  private async validateEmail(email: string): Promise<SecurityCheckResult> {
    const validation = emailValidator.validateEmail(email);
    
    if (!validation.isValid) {
      return {
        allowed: false,
        confidence: 1.0,
        reasons: validation.errors,
        actions: ['Please use a valid email address']
      };
    }

    // Check email reputation
    const reputation = EmailReputationService.calculateReputationScore(email);
    
    if (reputation < 0.3) {
      return {
        allowed: false,
        confidence: 0.8,
        reasons: ['Email domain has low reputation'],
        actions: ['Please use a different email address']
      };
    }

    const result: SecurityCheckResult = {
      allowed: true,
      confidence: validation.score,
      reasons: []
    };

    // Require email verification for medium reputation emails
    if (reputation < 0.7) {
      result.requiresEmailVerification = true;
      result.actions = ['Email verification will be required'];
    }

    return result;
  }

  private async analyzeIP(context: SecurityContext): Promise<SecurityCheckResult> {
    try {
      const ipInfo = await ipDetectionService.analyzeIP(context.ip, context.userAgent);
      
      if (ipInfo.threatLevel === 'high') {
        return {
          allowed: false,
          confidence: 0.9,
          reasons: ['IP address flagged as high risk'],
          actions: ['Access denied from this IP address']
        };
      }

      if (ipInfo.reputation < 30) {
        return {
          allowed: false,
          confidence: 0.8,
          reasons: ['IP address has poor reputation'],
          actions: ['Access restricted from this IP address']
        };
      }

      const result: SecurityCheckResult = {
        allowed: true,
        confidence: ipInfo.reputation / 100,
        reasons: []
      };

      if (ipInfo.isVpn || ipInfo.isProxy) {
        result.confidence *= 0.7;
        result.reasons.push('VPN/Proxy detected');
        result.requiresCaptcha = true;
      }

      if (ipInfo.threatLevel === 'medium') {
        result.confidence *= 0.8;
        result.reasons.push('IP address flagged as medium risk');
      }

      return result;

    } catch (error) {
      console.error('IP analysis failed:', error);
      
      // Allow but with reduced confidence on IP analysis failure
      return {
        allowed: true,
        confidence: 0.5,
        reasons: ['IP analysis unavailable'],
        requiresCaptcha: true
      };
    }
  }

  private async analyzeThreat(context: SecurityContext): Promise<SecurityCheckResult> {
    const threatScore = threatAnalyzer.analyzeThreat(
      context.email || 'anonymous',
      context.ip,
      context.userAgent,
      context.action === 'login' ? 'login_attempt' : 'signup_attempt'
    );

    if (threatScore.overall > 80) {
      return {
        allowed: false,
        confidence: 0.9,
        reasons: threatScore.risks,
        actions: ['Access denied due to high threat level']
      };
    }

    if (threatScore.overall > 60) {
      return {
        allowed: true,
        confidence: 0.4,
        reasons: threatScore.risks,
        actions: ['Complete additional verification'],
        requiresCaptcha: true
      };
    }

    return {
      allowed: true,
      confidence: Math.max(0.1, 1.0 - threatScore.overall / 100),
      reasons: threatScore.overall > 30 ? threatScore.risks : []
    };
  }

  private calculateCombinedRisk(
    context: SecurityContext,
    results: SecurityCheckResult[]
  ): SecurityCheckResult {
    const allowedResults = results.filter(r => r.allowed);
    
    if (allowedResults.length !== results.length) {
      // Return the first blocking result
      return results.find(r => !r.allowed) || results[0];
    }

    // Calculate combined confidence
    const avgConfidence = allowedResults.reduce((sum, r) => sum + r.confidence, 0) / allowedResults.length;
    const minConfidence = Math.min(...allowedResults.map(r => r.confidence));
    const combinedConfidence = (avgConfidence + minConfidence) / 2;

    // Combine reasons
    const allReasons = allowedResults.reduce((acc, r) => [...acc, ...r.reasons], [] as string[]);
    const uniqueReasons = [...new Set(allReasons)];

    // Determine if additional verification is needed
    const requiresCaptcha = allowedResults.some(r => r.requiresCaptcha) || combinedConfidence < 0.6;
    const requiresEmailVerification = allowedResults.some(r => r.requiresEmailVerification);

    const actions: string[] = [];
    if (requiresCaptcha) actions.push('Complete CAPTCHA verification');
    if (requiresEmailVerification) actions.push('Email verification required');

    return {
      allowed: true,
      confidence: combinedConfidence,
      reasons: uniqueReasons,
      actions,
      requiresCaptcha,
      requiresEmailVerification
    };
  }

  private async recordSecurityEvent(
    context: SecurityContext,
    result: SecurityCheckResult
  ): Promise<void> {
    try {
      // Record event for threat analysis
      threatAnalyzer.recordEvent({
        type: context.action === 'login' ? 'login_attempt' : 
              context.action === 'signup' ? 'signup_attempt' : 'password_reset',
        severity: result.allowed ? 'low' : result.confidence > 0.8 ? 'critical' : 'medium',
        source: context.ip,
        userAgent: context.userAgent,
        email: context.email,
        details: {
          allowed: result.allowed,
          confidence: result.confidence,
          reasons: result.reasons,
          requiresCaptcha: result.requiresCaptcha
        }
      });

      // Record rate limit attempt
      const identifier = context.email || context.ip;
      let rateLimit;

      switch (context.action) {
        case 'login':
          rateLimit = loginRateLimit;
          break;
        case 'signup':
          rateLimit = signupRateLimit;
          break;
        case 'password_reset':
          rateLimit = passwordResetRateLimit;
          break;
        default:
          rateLimit = loginRateLimit;
      }

      rateLimit.recordAttempt(identifier, result.allowed && result.confidence > 0.8);

    } catch (error) {
      console.error('Failed to record security event:', error);
    }
  }

  // Utility methods
  createHoneypot() {
    return HoneypotTrap.createHoneypot();
  }

  generateCaptcha() {
    return SimpleCaptcha.generateChallenge();
  }

  verifyCaptcha(id: string, answer: string): boolean {
    return SimpleCaptcha.verifyCaptcha(id, answer);
  }

  async verifyEmailAddress(user: any) {
    return EmailVerificationService.sendVerification(user);
  }

  isEmailVerified(user: any): boolean {
    return EmailVerificationService.isEmailVerified(user);
  }

  getThreatStats() {
    return threatAnalyzer.getThreatStats();
  }
}

export const securityService = new SecurityService();

// Export individual services for direct access if needed
export {
  loginRateLimit,
  signupRateLimit,
  passwordResetRateLimit,
  botDetector,
  HoneypotTrap,
  SimpleCaptcha,
  emailValidator,
  EmailVerificationService,
  EmailReputationService,
  threatAnalyzer,
  ipDetectionService
};