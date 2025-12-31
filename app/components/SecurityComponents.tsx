'use client';
import React, { useState } from 'react';
import { Shield, AlertTriangle, Clock } from 'lucide-react';

interface CaptchaChallenge {
  id: string;
  question: string;
}

interface SecurityCaptchaProps {
  challenge: CaptchaChallenge;
  onVerify: (captchaId: string, answer: string) => boolean;
  error?: string;
}

export const SecurityCaptcha: React.FC<SecurityCaptchaProps> = ({
  challenge,
  onVerify,
  error
}) => {
  const [answer, setAnswer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    const isValid = onVerify(challenge.id, answer);
    
    if (!isValid) {
      setAnswer('');
    }
    
    setIsVerifying(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-blue-900">Security Verification Required</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">
            {challenge.question}
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your answer"
            disabled={isVerifying}
          />
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isVerifying || !answer.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

interface HoneypotFieldProps {
  honeypot: { fieldName: string; fieldId: string };
  value: string;
  onChange: (value: string) => void;
}

export const HoneypotField: React.FC<HoneypotFieldProps> = ({
  honeypot,
  value,
  onChange
}) => {
  return (
    <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }}>
      <label htmlFor={honeypot.fieldId}>
        Website (leave blank)
      </label>
      <input
        id={honeypot.fieldId}
        name={honeypot.fieldName}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
};

interface SecurityIndicatorProps {
  threatLevel: 'low' | 'medium' | 'high';
  confidence: number;
  reasons: string[];
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  threatLevel,
  confidence,
  reasons
}) => {
  const getColor = () => {
    switch (threatLevel) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getIcon = () => {
    switch (threatLevel) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
    }
  };

  if (reasons.length === 0) return null;

  return (
    <div className={`border rounded-lg p-3 mb-4 ${getColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        <span>{getIcon()}</span>
        <span className="font-medium">
          Security Alert ({threatLevel} risk)
        </span>
      </div>
      <ul className="text-sm space-y-1">
        {reasons.map((reason, index) => (
          <li key={index} className="flex items-center gap-2">
            <span>•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-xs">
        Confidence: {Math.round(confidence * 100)}%
      </div>
    </div>
  );
};

interface RateLimitWarningProps {
  retryAfter: number;
}

export const RateLimitWarning: React.FC<RateLimitWarningProps> = ({
  retryAfter
}) => {
  const [timeLeft, setTimeLeft] = useState(retryAfter);

  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (timeLeft <= 0) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-red-600" />
        <h3 className="font-medium text-red-900">Rate Limit Exceeded</h3>
      </div>
      <p className="text-sm text-red-700 mb-2">
        Too many attempts detected. Please wait before trying again.
      </p>
      <div className="flex items-center gap-2 text-sm font-mono text-red-800">
        <span>Retry in:</span>
        <span className="bg-red-100 px-2 py-1 rounded">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};

interface EmailVerificationPromptProps {
  onResendVerification: () => Promise<{ success: boolean; message: string }>;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({
  onResendVerification
}) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setMessage('');
    
    try {
      const result = await onResendVerification();
      setMessage(result.message);
    } catch (error) {
      setMessage('Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="font-medium text-orange-900">Email Verification Required</h3>
      </div>
      
      <p className="text-sm text-orange-700 mb-3">
        Please verify your email address before continuing. Check your inbox for a verification email.
      </p>
      
      {message && (
        <div className={`text-sm mb-3 ${
          message.includes('sent') ? 'text-green-700' : 'text-red-700'
        }`}>
          {message}
        </div>
      )}
      
      <button
        onClick={handleResend}
        disabled={isResending}
        className="text-sm text-orange-600 hover:text-orange-800 underline disabled:opacity-50"
      >
        {isResending ? 'Sending...' : 'Resend verification email'}
      </button>
    </div>
  );
};