'use client';
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useSecurityAuth } from '@/app/hooks/useSecurityAuth';
import {
  SecurityCaptcha,
  HoneypotField,
  SecurityIndicator,
  RateLimitWarning,
  EmailVerificationPrompt
} from '@/app/components/SecurityComponents';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState('');
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const {
    securityState,
    performSecurityCheck,
    generateCaptcha,
    verifyCaptcha,
    trackTextInput,
    resetSecurityState,
    checkEmailVerification,
    sendEmailVerification
  } = useSecurityAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    // Prepare form data for security check
    const formData = {
      email,
      password,
      [securityState.honeypot?.fieldName || 'website_url']: honeypotValue
    };

    try {
      setError('');
      setLoading(true);

      // Perform security check first
      const securityResult = await performSecurityCheck(email, 'login', formData);
      
      if (!securityResult.allowed) {
        setError(securityResult.reasons.join('. '));
        setLoading(false);
        
        if (securityResult.requiresCaptcha) {
          generateCaptcha();
        }
        return;
      }

      // Proceed with login if security check passes
      const userCredential = await login(email, password);
      const user = userCredential.user;

      // Check email verification if required
      if (securityResult.requiresEmailVerification) {
        const isVerified = await checkEmailVerification(user);
        if (!isVerified) {
          setLoading(false);
          return; // Stay on login page until email is verified
        }
      }

      router.push('/courses/');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      
      // Basic security check for Google sign-in
      const securityResult = await performSecurityCheck('', 'login');
      
      if (!securityResult.allowed) {
        setError(securityResult.reasons.join('. '));
        setLoading(false);
        return;
      }

      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      // Check email verification for Google accounts too
      if (securityResult.requiresEmailVerification && user.email) {
        const isVerified = await checkEmailVerification(user);
        if (!isVerified) {
          setLoading(false);
          return;
        }
      }

      router.push('/courses/');
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCaptchaVerify = (captchaId: string, answer: string): boolean => {
    return verifyCaptcha(captchaId, answer);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    trackTextInput(value + password);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    trackTextInput(email + value);
  };

  const handleResendVerification = async () => {
    if (email) {
      return sendEmailVerification({ email });
    }
    return { success: false, message: 'No email address provided' };
  };

  return (
    <div className="h-[90vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edutube</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Rate Limit Warning */}
        {securityState.retryAfter && (
          <RateLimitWarning retryAfter={securityState.retryAfter} />
        )}

        {/* Security Indicator */}
        {securityState.error && !securityState.retryAfter && (
          <SecurityIndicator
            threatLevel="medium"
            confidence={0.8}
            reasons={[securityState.error]}
          />
        )}

        {/* Email Verification Prompt */}
        {securityState.requiresEmailVerification && (
          <EmailVerificationPrompt
            onResendVerification={handleResendVerification}
          />
        )}

        {/* CAPTCHA Challenge */}
        {securityState.requiresCaptcha && securityState.captcha && (
          <SecurityCaptcha
            challenge={securityState.captcha}
            onVerify={handleCaptchaVerify}
            error={securityState.error || undefined}
          />
        )}

        {error && !securityState.retryAfter && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot Field */}
          {securityState.honeypot && (
            <HoneypotField
              honeypot={securityState.honeypot}
              value={honeypotValue}
              onChange={setHoneypotValue}
            />
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              placeholder="Enter your email"
              disabled={loading || securityState.loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              placeholder="Enter your password"
              disabled={loading || securityState.loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || securityState.loading || !!securityState.retryAfter}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading || securityState.loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || securityState.loading || !!securityState.retryAfter}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <FcGoogle className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-black hover:text-gray-800">
              Sign up
            </Link>
          </p>
        </div>

        {/* Security Reset Button */}
        {(securityState.error || securityState.requiresCaptcha) && (
          <div className="mt-4 text-center">
            <button
              onClick={resetSecurityState}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Reset Security Check
            </button>
          </div>
        )}
      </div>
    </div>
  );
}