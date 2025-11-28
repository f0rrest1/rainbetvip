"use client";

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { ParsedBonusCode, CreateBonusCodeRequest, UpdateBonusCodeRequest } from '@/types/bonusCode';
import { authenticatedFetchJson, handleApiError } from '@/lib/authenticatedFetch';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function BonusCodeManagement() {
  const [bonusCodes, setBonusCodes] = useState<ParsedBonusCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    messageType: '' as string,
    source: '' as string,
    expired: undefined as boolean | undefined
  });

  // Create form state
  const [createForm, setCreateForm] = useState<CreateBonusCodeRequest>({
    code: '',
    rewardAmount: '',
    wageredRequirement: '',
    claimsCount: '',
    expiryDuration: '',
    messageType: 'Rainbet Bonus',
    expiresAt: ''
  });

  // Fetch bonus codes
  const fetchBonusCodes = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
      if (filters.messageType) queryParams.append('messageType', filters.messageType);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.expired !== undefined) queryParams.append('expired', filters.expired.toString());
      
      const result = await authenticatedFetchJson<{ success: boolean; data: ParsedBonusCode[]; error?: string }>(
        `/api/bonus-codes?${queryParams.toString()}`,
        { method: 'GET' },
        user
      );

      if (result.success && Array.isArray(result.data)) {
        setBonusCodes(result.data);
      } else {
        setError(result.error || 'Failed to load bonus codes');
      }
    } catch (err) {
      console.error('Error fetching bonus codes:', err);
      setError('Failed to load bonus codes');
    } finally {
      setIsLoading(false);
    }
  }, [filters, user]);

  // Create bonus code
  const createBonusCode = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (!user) {
        setError('You must be logged in to create bonus codes');
        return;
      }

      // Validate required fields
      if (!createForm.code || !createForm.rewardAmount || !createForm.wageredRequirement || 
          !createForm.claimsCount || !createForm.expiryDuration || !createForm.expiresAt) {
        setError('Please fill in all required fields');
        return;
      }
      
      const result = await authenticatedFetchJson<{ success: boolean; error?: string }>(
        '/api/bonus-codes',
        {
          method: 'POST',
          body: JSON.stringify(createForm)
        },
        user
      );
      
      if (result.success) {
        setSuccess('Bonus code created successfully!');
        setShowCreateForm(false);
        setCreateForm({
          code: '',
          rewardAmount: '',
          wageredRequirement: '',
          claimsCount: '',
          expiryDuration: '',
          messageType: 'Rainbet Bonus',
          expiresAt: ''
        });
        fetchBonusCodes();
      } else {
        setError(result.error || 'Failed to create bonus code');
      }
    } catch (err) {
      console.error('Error creating bonus code:', err);
      setError(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Update bonus code
  const updateBonusCode = async (updates: UpdateBonusCodeRequest) => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (!user) {
        setError('You must be logged in to update bonus codes');
        return;
      }
      
      const result = await authenticatedFetchJson<{ success: boolean; error?: string }>(
        `/api/bonus-codes/${updates.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates)
        },
        user
      );
      
      if (result.success) {
        setSuccess('Bonus code updated successfully!');
        fetchBonusCodes();
      } else {
        setError(result.error || 'Failed to update bonus code');
      }
    } catch (err) {
      console.error('Error updating bonus code:', err);
      setError(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete bonus code
  const deleteBonusCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bonus code?')) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      if (!user) {
        setError('You must be logged in to delete bonus codes');
        return;
      }
      
      const result = await authenticatedFetchJson<{ success: boolean; error?: string }>(
        `/api/bonus-codes/${id}`,
        { method: 'DELETE' },
        user
      );
      
      if (result.success) {
        setSuccess('Bonus code deleted successfully!');
        fetchBonusCodes();
      } else {
        setError(result.error || 'Failed to delete bonus code');
      }
    } catch (err) {
      console.error('Error deleting bonus code:', err);
      setError(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const toggleActive = async (code: ParsedBonusCode) => {
    await updateBonusCode({
      id: code.id,
      isActive: !code.isActive
    });
  };

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBonusCodes();
    }
  }, [user, filters, fetchBonusCodes]);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (authLoading || isLoading) {
    return (
      <div className="text-center py-8">
        <svg className="w-8 h-8 animate-spin mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <p className="text-white/70">Loading bonus codes...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-300 mb-2">Authentication Required</h3>
          <p className="text-red-200/80 text-sm">
            You must be logged in to access bonus code management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Bonus Code Management</h2>
            <p className="text-white/70">Manage bonus codes from Telegram and manual entries</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/70">Authenticated as {user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
              }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Type</label>
            <select
              value={filters.messageType}
              onChange={(e) => setFilters(prev => ({ ...prev, messageType: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">All</option>
              <option value="Rainbet Bonus">Standard</option>
              <option value="Rainbet Vip Bonus">VIP</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">All</option>
              <option value="telegram">Telegram</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Expiry</label>
            <select
              value={filters.expired === undefined ? '' : filters.expired.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                expired: e.target.value === '' ? undefined : e.target.value === 'true' 
              }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">All</option>
              <option value="false">Active</option>
              <option value="true">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-white/70">
          {bonusCodes.length} bonus code{bonusCodes.length !== 1 ? 's' : ''} found
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Manual Code
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Create Bonus Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Code</label>
              <input
                type="text"
                value={createForm.code}
                onChange={(e) => setCreateForm(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="RAIN9HLC"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Message Type</label>
              <select
                value={createForm.messageType}
                onChange={(e) => setCreateForm(prev => ({ ...prev, messageType: e.target.value as 'Rainbet Bonus' | 'Rainbet Vip Bonus' }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="Rainbet Bonus">Standard</option>
                <option value="Rainbet Vip Bonus">VIP</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Reward Amount</label>
              <input
                type="text"
                value={createForm.rewardAmount}
                onChange={(e) => setCreateForm(prev => ({ ...prev, rewardAmount: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="2-30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Wagered Requirement</label>
              <input
                type="text"
                value={createForm.wageredRequirement}
                onChange={(e) => setCreateForm(prev => ({ ...prev, wageredRequirement: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="5000-72000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Claims Count</label>
              <input
                type="text"
                value={createForm.claimsCount}
                onChange={(e) => setCreateForm(prev => ({ ...prev, claimsCount: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="200-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Expiry Duration</label>
              <input
                type="text"
                value={createForm.expiryDuration}
                onChange={(e) => setCreateForm(prev => ({ ...prev, expiryDuration: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="24"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/90 mb-2">Expires At</label>
              <input
                type="datetime-local"
                value={createForm.expiresAt}
                onChange={(e) => setCreateForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="mm/dd/yyyy, --:-- --"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={createBonusCode}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Code'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bonus Codes Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Reward</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bonusCodes.map((code, index) => {
                const rowKey = code.id || `${code.code}-${index}`;
                const isExpired = dayjs(code.expiresAt).isBefore(dayjs());
                return (
                  <tr key={rowKey} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-white">{code.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        code.messageType === 'Rainbet Vip Bonus' 
                          ? 'bg-yellow-500/20 text-yellow-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {code.messageType === 'Rainbet Vip Bonus' ? 'VIP' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {code.rewardAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        code.source === 'telegram' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {code.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          code.isActive && !isExpired ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm text-white/90">
                          {code.isActive && !isExpired ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {dayjs(code.expiresAt).fromNow()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(code)}
                          className={`px-2 py-1 text-xs rounded ${
                            code.isActive 
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          }`}
                        >
                          {code.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteBonusCode(code.id)}
                          className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {bonusCodes.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No Bonus Codes Found</h3>
            <p className="text-white/70 text-sm">Try adjusting your filters or create a new code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
