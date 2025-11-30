'use client';
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Activity, Users, Clock } from 'lucide-react';
import { securityService } from '@/app/lib/security';

interface ThreatStats {
  totalEvents: number;
  uniqueIps: number;
  highRiskIps: number;
  recentEvents: number;
}

export const SecurityDashboard: React.FC = () => {
  const [stats, setStats] = useState<ThreatStats>({
    totalEvents: 0,
    uniqueIps: 0,
    highRiskIps: 0,
    recentEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      try {
        const threatStats = securityService.getThreatStats();
        setStats(threatStats);
      } catch (error) {
        console.error('Failed to load security stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getThreatLevel = () => {
    const riskPercentage = stats.uniqueIps > 0 ? (stats.highRiskIps / stats.uniqueIps) * 100 : 0;
    
    if (riskPercentage > 20) return { level: 'high', color: 'text-red-600 bg-red-50 border-red-200' };
    if (riskPercentage > 10) return { level: 'medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { level: 'low', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  const threatLevel = getThreatLevel();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security Dashboard</h2>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${threatLevel.color}`}>
            {threatLevel.level.toUpperCase()} RISK
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Events */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalEvents}</span>
            </div>
            <p className="text-sm text-gray-600">Total Security Events</p>
          </div>

          {/* Unique IPs */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{stats.uniqueIps}</span>
            </div>
            <p className="text-sm text-blue-700">Unique IP Addresses</p>
          </div>

          {/* High Risk IPs */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-900">{stats.highRiskIps}</span>
            </div>
            <p className="text-sm text-red-700">High Risk IPs</p>
          </div>

          {/* Recent Events */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-900">{stats.recentEvents}</span>
            </div>
            <p className="text-sm text-orange-700">Last Hour</p>
          </div>
        </div>

        {/* Security Features Status */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-3">Active Security Features</h3>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Rate Limiting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Bot Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Email Validation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Threat Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>IP Detection</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Security Recommendations</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {stats.highRiskIps > 0 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>Monitor high-risk IP addresses closely</span>
                </div>
              )}
              
              {stats.recentEvents > 50 && (
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>High activity detected - review recent events</span>
                </div>
              )}
              
              {stats.totalEvents === 0 && (
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Security system is active and monitoring</span>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <span>Regular security audits recommended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Percentage */}
        {stats.uniqueIps > 0 && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Risk Assessment</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>High Risk IP Percentage</span>
                  <span>{Math.round((stats.highRiskIps / stats.uniqueIps) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (stats.highRiskIps / stats.uniqueIps) * 100 > 20 
                        ? 'bg-red-500' 
                        : (stats.highRiskIps / stats.uniqueIps) * 100 > 10 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((stats.highRiskIps / stats.uniqueIps) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;