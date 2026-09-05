"use client";

import * as React from "react";
import type { MomentOccasion, OccasionConfig } from "@/lib/moments-types";
import MomentUnboxingCeremony from "./moment-unboxing-ceremony";

export interface MomentUnsealStageProps {
  occasion: MomentOccasion;
  recipientName: string;
  senderName: string;
  config?: OccasionConfig;
  onUnsealed?: () => void;
  onOpened?: () => void;
  isOpened?: boolean;
  onReplay?: () => void;
}

export default function MomentUnsealStage({
  occasion,
  recipientName,
  senderName,
  onUnsealed,
  onOpened,
  isOpened = false,
  onReplay,
}: MomentUnsealStageProps) {
  const handleOpened = React.useCallback(() => {
    if (onUnsealed) onUnsealed();
    if (onOpened) onOpened();
  }, [onUnsealed, onOpened]);

  return (
    <MomentUnboxingCeremony
      occasion={occasion}
      recipientName={recipientName}
      senderName={senderName}
      onOpened={handleOpened}
      isOpened={isOpened}
      onReplay={onReplay}
    />
  );
}
