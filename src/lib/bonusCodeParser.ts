import { ParsedBonusCode, TelegramMessage } from '@/types/bonusCode';

export class BonusCodeParser {
  private static readonly BONUS_PATTERNS = {
    // Pattern for "Rainbet Bonus" or "Rainbet Vip Bonus"
    title: /^(Rainbet\s+(?:Vip\s+)?Bonus)\s*$/i,
    
    // Pattern for "Bonus Drop!"
    bonusDrop: /^Bonus\s+Drop!$/i,
    
    // Pattern for "Reward: $2-$30"
    reward: /^Reward:\s*\$?(\d+(?:\.\d+)?)(?:-\$?(\d+(?:\.\d+)?))?$/i,
    
    // Pattern for "Wagered: $5,000-$72,000 past X days"
    wagered: /^Wagered:\s*\$?([\d,]+)(?:-\$?([\d,]+))?\s+past\s+(\d+)\s+days$/i,
    
    // Pattern for "Claims: 200-300"
    claims: /^Claims:\s*(\d+)(?:-(\d+))?$/i,
    
    // Pattern for "Claimable for 24 Hours"
    expiry: /^Claimable\s+for\s+(\d+)\s+Hours?$/i,
    
    // Pattern for "Code: RAIN9HLC / RainM5LK / RainQ2HF"
    code: /^Code:\s*([A-Za-z0-9]+(?:\s*\/\s*[A-Za-z0-9]+)*)$/i,
  };

  /**
   * Parse a Telegram message to extract bonus code information
   */
  static parseMessage(message: TelegramMessage): ParsedBonusCode | null {
    if (!message.text) {
      return null;
    }

    const lines = message.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 6) {
      return null; // Not enough lines for a valid bonus code message
    }

    try {
      const parsed = this.parseLines(lines, message);
      return parsed;
    } catch (error) {
      console.error('Error parsing bonus code message:', error);
      return null;
    }
  }

  /**
   * Parse individual lines of the message
   */
  private static parseLines(lines: string[], message: TelegramMessage): ParsedBonusCode | null {
    let titleMatch: RegExpMatchArray | null = null;
    let rewardMatch: RegExpMatchArray | null = null;
    let wageredMatch: RegExpMatchArray | null = null;
    let claimsMatch: RegExpMatchArray | null = null;
    let expiryMatch: RegExpMatchArray | null = null;
    let codeMatch: RegExpMatchArray | null = null;

    // Find matches for each pattern
    for (const line of lines) {
      if (!titleMatch) titleMatch = line.match(this.BONUS_PATTERNS.title);
      if (!rewardMatch) rewardMatch = line.match(this.BONUS_PATTERNS.reward);
      if (!wageredMatch) wageredMatch = line.match(this.BONUS_PATTERNS.wagered);
      if (!claimsMatch) claimsMatch = line.match(this.BONUS_PATTERNS.claims);
      if (!expiryMatch) expiryMatch = line.match(this.BONUS_PATTERNS.expiry);
      if (!codeMatch) codeMatch = line.match(this.BONUS_PATTERNS.code);
    }

    // Validate that we have all required matches (expiry is now optional)
    if (!titleMatch || !rewardMatch || !wageredMatch || !claimsMatch || !codeMatch) {
      return null;
    }

    // Extract the first code from the code line (ignore multiple codes for now)
    const codeLine = codeMatch[1];
    const codes = codeLine.split(/\s*\/\s*/).map(code => code.trim());
    const primaryCode = codes[0];

    if (!primaryCode || primaryCode.length === 0) {
      return null;
    }

    // Parse reward amount
    const rewardMin = parseFloat(rewardMatch[1]);
    const rewardMax = rewardMatch[2] ? parseFloat(rewardMatch[2]) : rewardMin;
    const rewardAmount = rewardMin === rewardMax ? `$${rewardMin}` : `$${rewardMin}-$${rewardMax}`;

    // Parse wagered requirement
    const wageredMin = wageredMatch[1].replace(/,/g, '');
    const wageredMax = wageredMatch[2] ? wageredMatch[2].replace(/,/g, '') : wageredMin;
    const days = wageredMatch[3];
    const wageredRequirement = wageredMin === wageredMax 
      ? `$${parseInt(wageredMin).toLocaleString()} past ${days} days`
      : `$${parseInt(wageredMin).toLocaleString()}-$${parseInt(wageredMax).toLocaleString()} past ${days} days`;

    // Parse claims count
    const claimsMin = parseInt(claimsMatch[1]);
    const claimsMax = claimsMatch[2] ? parseInt(claimsMatch[2]) : claimsMin;
    const claimsCount = claimsMin === claimsMax ? claimsMin.toString() : `${claimsMin}-${claimsMax}`;

    // Parse expiry duration (optional)
    let expiryDuration = 'Never expires'; // Default if not specified
    let expiresAt: string | null = null; // No expiry by default
    
    if (expiryMatch) {
      const hours = parseInt(expiryMatch[1]);
      expiryDuration = `${hours} Hour${hours !== 1 ? 's' : ''}`;
      // Calculate expiry timestamp only if expiry is specified
      expiresAt = new Date(Date.now() + (hours * 60 * 60 * 1000)).toISOString();
    }

    // Determine message type
    const messageType = titleMatch[1].toLowerCase().includes('vip') 
      ? 'Rainbet Vip Bonus' as const 
      : 'Rainbet Bonus' as const;

    // Calculate creation timestamp
    const createdAt = new Date(message.date * 1000).toISOString();

    // Generate unique ID
    const id = `bonus_${message.chat.id}_${message.message_id}_${Date.now()}`;

    return {
      id,
      code: primaryCode,
      rewardAmount,
      wageredRequirement,
      claimsCount,
      expiryDuration,
      messageType,
      originalMessage: message.text || '',
      telegramMessageId: message.message_id,
      chatId: message.chat.id,
      createdAt,
      expiresAt,
      isActive: true,
      source: 'telegram'
    };
  }

  /**
   * Validate if a message looks like a bonus code message
   */
  static isValidBonusCodeMessage(text: string): boolean {
    if (!text) return false;
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check for key indicators
    const hasTitle = lines.some(line => this.BONUS_PATTERNS.title.test(line));
    const hasReward = lines.some(line => this.BONUS_PATTERNS.reward.test(line));
    const hasCode = lines.some(line => this.BONUS_PATTERNS.code.test(line));
    
    return hasTitle && hasReward && hasCode;
  }

  /**
   * Extract all codes from a code line
   */
  static extractAllCodes(codeLine: string): string[] {
    const match = codeLine.match(this.BONUS_PATTERNS.code);
    if (!match) return [];
    
    return match[1].split(/\s*\/\s*/).map(code => code.trim()).filter(code => code.length > 0);
  }
}
