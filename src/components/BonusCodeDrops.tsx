"use client";
import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import clsx from "clsx";
import { CopyToClipboard } from "./CopyToClipboard";
import { Flipper, Flipped } from "react-flip-toolkit";
import { ParsedBonusCode } from "@/types/bonusCode";

export default function BonusCodeDrops() {
  dayjs.extend(relativeTime);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bonusCodes, setBonusCodes] = useState<ParsedBonusCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bonus codes from API
  useEffect(() => {
    const fetchBonusCodes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/bonus-codes?isActive=true&expired=false');
        const result = await response.json();
        
        if (result.success) {
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
    };

    fetchBonusCodes();
  }, []);

  const getCategoryColor = (messageType: string) => {
    switch (messageType) {
      case 'Rainbet Vip Bonus': return 'rbv-badge-warning';
      case 'Rainbet Bonus': return 'rbv-badge';
      default: return 'rbv-badge';
    }
  };

  const flipKey = useMemo(() => (copiedCode ? `copied-${copiedCode}` : "initial"), [copiedCode]);

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rbv-badge mb-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Fresh Code Drops
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Latest <span className="text-gradient-primary">Bonus Codes</span>
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Exclusive codes updated regularly. Copy instantly and unlock premium rewards.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <p className="text-white/70">Loading bonus codes...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading Codes</h3>
            <p className="text-red-200/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && bonusCodes.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No Active Codes</h3>
            <p className="text-white/70 text-sm">Check back later for new bonus codes!</p>
          </div>
        </div>
      )}

      {/* Enhanced code cards grid */}
      {!isLoading && !error && bonusCodes.length > 0 && (
        <Flipper flipKey={flipKey} spring={{ stiffness: 180, damping: 20 }} staggerConfig={{ default: { speed: 0.5 } }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonusCodes.map((code, index) => {
            const isExpired = code.expiresAt ? dayjs(code.expiresAt).isBefore(dayjs()) : false;
            return (
                <Flipped key={code.id} flipId={code.id} stagger>
                  {(flippedProps) => (
                    <div
                      {...flippedProps}
                      className={clsx(
                        "rbv-card-premium p-6 flex flex-col gap-4 animate-float transition-transform duration-200",
                        copiedCode === code.code && "ring-2 ring-green-400/60",
                        isExpired && "opacity-50 saturate-50"
                      )}
                      style={{
                        animationDelay: `${index * 0.2}s`,
                      }}
                    >
                {/* Header with code and category */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                      <span className={getCategoryColor(code.messageType)}>
                        {code.messageType}
                      </span>
                    </div>
                    <div className="text-2xl font-bold tracking-wider font-mono text-gradient-primary">
                      {code.code}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex flex-col items-end">
                    <div className={clsx(
                      "w-3 h-3 rounded-full",
                      isExpired ? "bg-red-500" : "bg-green-500 animate-pulse"
                    )} />
                    <span className="text-xs text-white/60 mt-1">
                      {isExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Bonus details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Reward:</span>
                    <span className="text-white font-medium">{code.rewardAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Wagered:</span>
                    <span className="text-white font-medium">{code.wageredRequirement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Claims:</span>
                    <span className="text-white font-medium">{code.claimsCount}</span>
                  </div>
                </div>

                {/* Posted and Expiry info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Posted {dayjs(code.createdAt).fromNow()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {code.expiresAt ? `Expires ${dayjs(code.expiresAt).fromNow()}` : "Never expires"}
                  </div>
                </div>

                {/* Enhanced copy button */}
                <CopyToClipboard
                  text={code.code}
                  onCopied={() => {
                    setCopiedCode(code.code);
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                >
                  <button
                    className={clsx(
                      "rbv-button-primary w-full gap-2 transition-all duration-300",
                      copiedCode === code.code && "bg-green-500 border-green-400",
                      isExpired && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isExpired}
                  >
                    {copiedCode === code.code ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                        </svg>
                        Copied Successfully!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                        Copy Code
                      </>
                    )}
                  </button>
                </CopyToClipboard>
                    </div>
                  )}
                </Flipped>
            );
            })}
          </div>
        </Flipper>
      )}
    </div>
  );
}


