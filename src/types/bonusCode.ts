export interface ParsedBonusCode {
  id: string;
  code: string;
  rewardAmount: string;
  wageredRequirement: string;
  claimsCount: string;
  expiryDuration: string;
  messageType: 'Rainbet Bonus' | 'Rainbet Vip Bonus';
  originalMessage: string;
  telegramMessageId: number;
  chatId: number;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  source: 'telegram' | 'manual';
}

export interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
  };
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export interface BonusCodeFilters {
  isActive?: boolean;
  messageType?: 'Rainbet Bonus' | 'Rainbet Vip Bonus';
  source?: 'telegram' | 'manual';
  expired?: boolean;
}

export interface CreateBonusCodeRequest {
  code: string;
  rewardAmount: string;
  wageredRequirement: string;
  claimsCount: string;
  expiryDuration: string;
  messageType: 'Rainbet Bonus' | 'Rainbet Vip Bonus';
  expiresAt: string;
}

export interface UpdateBonusCodeRequest {
  id: string;
  isActive?: boolean;
  expiresAt?: string;
  rewardAmount?: string;
  wageredRequirement?: string;
  claimsCount?: string;
}
