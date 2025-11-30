'use client';
import { useState, useEffect } from 'react';
import { securityService, SecurityCheckResult, SecurityContext } from '@/app/lib/security';

interface SecurityState {
  isSecure: boolean;
  loading: boolean;
  error: string | null;
  requiresCaptcha: boolean;
  requiresEmailVerification: boolean;
  honeypot: { fieldName: string; fieldId: string } | null;
  captcha: { id: string; question: string } | null;
  retryAfter?: number;
}

interface InteractionTracking {
  startTime: number;
  endTime: number;
  textLength: number;
  mouseMovements: { x: number; y: number; timestamp: number }[];
}

export function useSecurityAuth() {
  const [securityState, setSecurityState] = useState<SecurityState>({
    isSecure: false,
    loading: false,
    error: null,
    requiresCaptcha: false,
    requiresEmailVerification: false,
    honeypot: null,
    captcha: null
  });

  const [interactionData, setInteractionData] = useState<InteractionTracking>({
    startTime: Date.now(),
    endTime: Date.now(),
    textLength: 0,
    mouseMovements: []
  });

  // Initialize honeypot and start interaction tracking
  useEffect(() => {
    const honeypot = securityService.createHoneypot();
    setSecurityState(prev => ({ ...prev, honeypot }));
    
    // Track mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      setInteractionData(prev => ({
        ...prev,
        mouseMovements: [
          ...prev.mouseMovements.slice(-10), // Keep last 10 movements
          { x: e.clientX, y: e.clientY, timestamp: Date.now() }
        ]
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Get client IP (simplified)
  const getClientIP = (): string => {
    // In a real implementation, you'd get this from the server or a service
    return 'client-ip-placeholder';
  };

  // Perform security check before authentication
  const performSecurityCheck = async (
    email: string,
    action: 'login' | 'signup' | 'password_reset',
    formData?: Record<string, any>
  ): Promise<SecurityCheckResult> => {
    setSecurityState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const context: SecurityContext = {
        email,
        ip: getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        action,
        formData,
        interactionData: {
          ...interactionData,
          endTime: Date.now(),
          textLength: email.length + (formData?.password?.length || 0)
        }
      };

      const result = await securityService.performSecurityCheck(context);

      setSecurityState(prev => ({
        ...prev,
        loading: false,
        isSecure: result.allowed,
        requiresCaptcha: result.requiresCaptcha || false,
        requiresEmailVerification: result.requiresEmailVerification || false,
        retryAfter: result.retryAfter,
        error: result.allowed ? null : result.reasons.join(', ')
      }));

      return result;

    } catch (error) {
      console.error('Security check failed:', error);
      
      setSecurityState(prev => ({
        ...prev,
        loading: false,
        error: 'Security check failed. Please try again.',
        isSecure: false
      }));

      return {
        allowed: false,
        confidence: 0,
        reasons: ['Security check failed']
      };
    }
  };

  // Generate CAPTCHA challenge
  const generateCaptcha = () => {
    const captcha = securityService.generateCaptcha();
    setSecurityState(prev => ({ ...prev, captcha, requiresCaptcha: true }));
    return captcha;
  };

  // Verify CAPTCHA response
  const verifyCaptcha = (captchaId: string, answer: string): boolean => {
    const isValid = securityService.verifyCaptcha(captchaId, answer);
    
    if (isValid) {
      setSecurityState(prev => ({ 
        ...prev, 
        requiresCaptcha: false, 
        captcha: null,
        error: null 
      }));
    } else {
      setSecurityState(prev => ({ 
        ...prev, 
        error: 'Invalid CAPTCHA. Please try again.' 
      }));
    }

    return isValid;
  };

  // Track text input changes
  const trackTextInput = (text: string) => {
    setInteractionData(prev => ({
      ...prev,
      textLength: text.length,
      endTime: Date.now()
    }));
  };

  // Reset security state
  const resetSecurityState = () => {
    setSecurityState({
      isSecure: false,
      loading: false,
      error: null,
      requiresCaptcha: false,
      requiresEmailVerification: false,
      honeypot: securityService.createHoneypot(),
      captcha: null
    });
    
    setInteractionData({
      startTime: Date.now(),
      endTime: Date.now(),
      textLength: 0,
      mouseMovements: []
    });
  };

  // Check if email verification is required
  const checkEmailVerification = async (user: any) => {
    if (!securityService.isEmailVerified(user)) {
      setSecurityState(prev => ({ ...prev, requiresEmailVerification: true }));
      return false;
    }
    return true;
  };

  // Send email verification
  const sendEmailVerification = async (user: any) => {
    try {
      await securityService.verifyEmailAddress(user);
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      return { success: false, message: 'Failed to send verification email' };
    }
  };

  return {
    securityState,
    performSecurityCheck,
    generateCaptcha,
    verifyCaptcha,
    trackTextInput,
    resetSecurityState,
    checkEmailVerification,
    sendEmailVerification,
    interactionData
  };
}