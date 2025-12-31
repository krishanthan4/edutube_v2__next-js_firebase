# Firebase Authentication Security System

## Overview

This comprehensive security system provides enterprise-level protection for your Firebase authentication system with the following features:

- **Rate Limiting** - Prevents brute force attacks
- **Bot Protection** - Detects and blocks automated attacks  
- **Email Validation** - Validates email domains and prevents disposable emails
- **Real-time Threat Analysis** - Monitors and analyzes user behavior patterns
- **IP Detection** - Identifies VPNs, proxies, and malicious IP addresses

## Security Features

### 🛡️ Rate Limiting
- **Login**: 5 attempts per 15 minutes, 1-hour block
- **Signup**: 3 attempts per hour, 24-hour block  
- **Password Reset**: 3 attempts per hour, 2-hour block

### 🤖 Bot Protection
- User agent analysis for bot indicators
- Typing pattern detection (speed, consistency)
- Mouse movement analysis
- Honeypot traps for automated form submission
- Simple CAPTCHA challenges

### ✉️ Email Validation
- Format validation with comprehensive regex
- Disposable email provider blocking
- Email reputation scoring
- Domain reputation analysis
- Email verification requirement for suspicious domains

### 🔍 Real-time Threat Analysis  
- IP frequency monitoring
- Failed attempt tracking
- Geographic pattern analysis
- Device fingerprint detection
- Time pattern analysis for automated behavior

### 🌐 IP Detection
- VPN/Proxy detection
- Malicious IP range blocking
- Geographic location analysis
- ISP reputation scoring
- Tor network detection

## Implementation

### Core Security Service

```typescript
import { securityService } from '@/app/lib/security';

// Perform comprehensive security check
const result = await securityService.performSecurityCheck({
  email: 'user@example.com',
  ip: '192.168.1.1',
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
  action: 'login',
  formData: { /* form data */ },
  interactionData: { /* user interaction data */ }
});

if (!result.allowed) {
  // Handle security block
  console.log('Security check failed:', result.reasons);
}
```

### Security Hook Usage

```typescript
import { useSecurityAuth } from '@/app/hooks/useSecurityAuth';

const {
  securityState,
  performSecurityCheck,
  generateCaptcha,
  verifyCaptcha
} = useSecurityAuth();

// Check security before authentication
const securityResult = await performSecurityCheck(email, 'login');
```

### Components Available

- `SecurityCaptcha` - CAPTCHA challenge component
- `HoneypotField` - Hidden field for bot detection  
- `SecurityIndicator` - Visual threat level indicator
- `RateLimitWarning` - Rate limit countdown display
- `EmailVerificationPrompt` - Email verification UI
- `SecurityDashboard` - Admin security monitoring

## Configuration

### Rate Limits
Customize rate limits by modifying the rate limiter instances:

```typescript
// In rateLimit.ts
export const loginRateLimit = new RateLimiter(
  5,           // max attempts
  15 * 60 * 1000,  // window (15 minutes)  
  60 * 60 * 1000   // block duration (1 hour)
);
```

### Bot Detection
Adjust bot detection sensitivity:

```typescript
// In botProtection.ts
const botDetector = new BotDetector();
// Customize thresholds in constructor
```

### Email Validation
Add custom disposable email domains:

```typescript
// In emailValidation.ts
emailValidator.addDisposableDomain('custom-disposable.com');
```

## Security Levels

### Low Risk (Green) 
- Standard authentication flow
- No additional verification required

### Medium Risk (Yellow)
- CAPTCHA challenge required
- Enhanced monitoring
- Email verification may be required

### High Risk (Red)
- Access blocked
- Manual review required
- IP address flagged

## Monitoring & Analytics

The `SecurityDashboard` component provides real-time monitoring of:

- Total security events
- Unique IP addresses accessing the system
- High-risk IP count
- Recent activity (last hour)
- Security feature status
- Risk assessment metrics

## Authentication Flow Integration

### Login Process
1. Security check performed before authentication
2. Rate limiting enforced per email/IP
3. Bot detection analysis
4. Email validation if required
5. IP threat analysis
6. CAPTCHA challenge if needed
7. Email verification if required
8. Firebase authentication
9. Security event logging

### Signup Process  
1. Enhanced security checks for new accounts
2. Email domain reputation analysis
3. Stronger bot protection
4. Mandatory email verification for suspicious accounts
5. Account creation with security metadata

## Error Handling

All security components include comprehensive error handling:

- Graceful degradation if security services fail
- User-friendly error messages
- Fallback security measures
- Detailed logging for debugging

## Best Practices

1. **Monitor the dashboard regularly** for security threats
2. **Customize rate limits** based on your application's usage patterns
3. **Update disposable email lists** periodically
4. **Review high-risk IPs** and consider additional verification
5. **Test CAPTCHA challenges** regularly for user experience
6. **Monitor false positives** and adjust thresholds accordingly

## Security Event Logging

All security events are logged with:
- Timestamp
- Event type (login_attempt, signup_attempt, etc.)
- Severity level  
- Source IP address
- User agent
- Email (if available)
- Security check results
- Actions taken

## Performance Considerations

- Security checks add ~100-300ms to authentication
- Memory usage scales with unique IPs and users
- Automatic cleanup of old security data
- Configurable cache timeouts
- Efficient rate limiting algorithms

## Dependencies

- Firebase Auth - Authentication provider
- Lucide React - Security dashboard icons
- Framer Motion - UI animations (optional)

## Support

For security issues or questions:
1. Check the security dashboard for current threat levels
2. Review security event logs
3. Adjust security thresholds as needed
4. Monitor user feedback for false positives

## Updates

The security system automatically:
- Cleans up old rate limit data
- Expires IP reputation cache
- Removes stale threat analysis data
- Maintains optimal performance