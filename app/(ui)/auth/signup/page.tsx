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

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState('');
  const { signup, signInWithGoogle } = useAuth();
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

    if (!email || !password || !passwordConfirm) {
      return setError('Please fill in all fields');
    }

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    // Prepare form data for security check
    const formData = {
      email,
      password,
      passwordConfirm,
      [securityState.honeypot?.fieldName || 'website_url']: honeypotValue
    };

    try {
      setError('');
      setLoading(true);

      // Perform security check first
      const securityResult = await performSecurityCheck(email, 'signup', formData);
      
      if (!securityResult.allowed) {
        setError(securityResult.reasons.join('. '));
        setLoading(false);
        
        if (securityResult.requiresCaptcha) {
          generateCaptcha();
        }
        return;
      }

      // Proceed with signup if security check passes
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // Send email verification if required
      if (securityResult.requiresEmailVerification || !user.emailVerified) {
        await sendEmailVerification(user);
        setLoading(false);
        return; // Stay on signup page until email is verified
      }

      router.push('/courses/');
    } catch (error) {
      setError('Failed to create an account. This email may already be in use.');
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
      const securityResult = await performSecurityCheck('', 'signup');
      
      if (!securityResult.allowed) {
        setError(securityResult.reasons.join('. '));
        setLoading(false);
        return;
      }

      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      // Google accounts are usually pre-verified, but check anyway
      if (securityResult.requiresEmailVerification && user.email && !user.emailVerified) {
        await sendEmailVerification(user);
        setLoading(false);
        return;
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
    trackTextInput(value + password + passwordConfirm);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    trackTextInput(email + value + passwordConfirm);
  };

  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    trackTextInput(email + password + value);
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
          <p className="text-gray-600 mt-2">Create your account</p>
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

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => handlePasswordConfirmChange(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              placeholder="Confirm your password"
              disabled={loading || securityState.loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || securityState.loading || !!securityState.retryAfter}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading || securityState.loading ? 'Creating Account...' : 'Sign Up'}
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
              Sign up with Google
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-black hover:text-gray-800">
              Sign in
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

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-4">
            <div className="text-xs text-gray-600 mb-1">Password strength:</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    password.length >= level * 2
                      ? level <= 2
                        ? 'bg-red-400'
                        : level === 3
                        ? 'bg-yellow-400'
                        : 'bg-green-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {password.length < 6 && 'Too short'}
              {password.length >= 6 && password.length < 8 && 'Weak'}
              {password.length >= 8 && password.length < 12 && 'Medium'}
              {password.length >= 12 && 'Strong'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}