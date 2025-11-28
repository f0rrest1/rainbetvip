"use client";
import { useCallback } from "react";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import Link from "next/link";

export function NavigationClient() {
  const { showDialog, ConfirmDialog: Dialog } = useConfirmDialog();

  const openRewardz = useCallback(() => {
    window.open("https://rewardz.gg", "_blank", "noopener,noreferrer");
  }, []);

  const openWits = useCallback(() => {
    window.open("https://wits.gg", "_blank", "noopener,noreferrer");
  }, []);

  const openRainbet = useCallback(() => {
    window.open("https://rainbet.com", "_blank", "noopener,noreferrer");
  }, []);

  const handleRewardz = useCallback(() => {
    showDialog({
      title: "Visit Rewardz.gg",
      message: "You're about to visit Rewardz.gg. This will open in a new tab.",
      confirmText: "Visit Rewardz",
      cancelText: "Cancel",
      type: "default",
      onConfirm: openRewardz,
    });
  }, [showDialog, openRewardz]);

  const handleWits = useCallback(() => {
    showDialog({
      title: "Visit Wits.gg",
      message: "You're about to visit Wits.gg. This will open in a new tab.",
      confirmText: "Visit Wits",
      cancelText: "Cancel",
      type: "default",
      onConfirm: openWits,
    });
  }, [showDialog, openWits]);

  const handlePlayNow = useCallback(() => {
    showDialog({
      title: "Play at Rainbet Casino",
      message: "You're about to visit Rainbet Casino. Please gamble responsibly. 18+ only.",
      confirmText: "Play Now",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: openRainbet,
    });
  }, [showDialog, openRainbet]);

  return (
    <>
      {/* Enhanced navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="/"
          className="relative px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors group"
        >
          Home
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
        </Link>
        <Link
          href="/news"
          className="relative px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors group"
        >
          News
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
        </Link>
        <button
          onClick={handleRewardz}
          className="relative px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-1">
            Rewardz
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
        </button>
        <button
          onClick={handleWits}
          className="relative px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-1">
            Wits
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
        </button>
        <button
          onClick={handlePlayNow}
          className="rbv-button-primary inline-flex items-center gap-2 text-xs px-4 py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Play Now
        </button>
      </nav>

      <Dialog />
    </>
  );
}