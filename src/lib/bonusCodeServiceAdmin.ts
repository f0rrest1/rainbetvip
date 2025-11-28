import { getAdminDb } from './firebase-admin';
import { 
  ParsedBonusCode, 
  BonusCodeFilters, 
  UpdateBonusCodeRequest 
} from '@/types/bonusCode';

export class BonusCodeServiceAdmin {
  private static readonly COLLECTION_NAME = 'bonusCodes';

  /**
   * Add a new bonus code to Firestore
   */
  static async createBonusCode(bonusCode: Omit<ParsedBonusCode, 'id'>): Promise<string> {
    try {
      const db = getAdminDb();
      const docRef = await db.collection(this.COLLECTION_NAME).add({
        ...bonusCode,
        createdAt: new Date(bonusCode.createdAt),
        expiresAt: bonusCode.expiresAt ? new Date(bonusCode.expiresAt) : null
      });
      
      console.log('Bonus code created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating bonus code:', error);
      throw new Error('Failed to create bonus code');
    }
  }

  /**
   * Get all bonus codes with optional filtering
   */
  static async getBonusCodes(filters?: BonusCodeFilters): Promise<ParsedBonusCode[]> {
    try {
      const db = getAdminDb();
      const query = db.collection(this.COLLECTION_NAME);

      // For now, get all documents and filter client-side to avoid index requirements
      // TODO: Create composite indexes for better performance

      const snapshot = await query.get();
      const bonusCodes: ParsedBonusCode[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        bonusCodes.push({
          ...data,
          id: doc.id, // Always use the actual Firestore document ID
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt
        } as ParsedBonusCode);
      });

      // Sort by createdAt (descending) - we'll do this after filtering

      // Apply client-side filters
      let filteredCodes = bonusCodes;

      // Filter by isActive
      if (filters?.isActive !== undefined) {
        filteredCodes = filteredCodes.filter(code => code.isActive === filters.isActive);
      }

      // Filter by messageType
      if (filters?.messageType) {
        filteredCodes = filteredCodes.filter(code => code.messageType === filters.messageType);
      }

      // Filter by source
      if (filters?.source) {
        filteredCodes = filteredCodes.filter(code => code.source === filters.source);
      }

      // Filter by expired status
      if (filters?.expired !== undefined) {
        const now = new Date();
        filteredCodes = filteredCodes.filter(code => {
          const isExpired = code.expiresAt ? new Date(code.expiresAt) < now : false;
          return filters.expired ? isExpired : !isExpired;
        });
      }

      // Sort by createdAt (descending)
      filteredCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return filteredCodes;
    } catch (error) {
      console.error('Error getting bonus codes:', error);
      throw new Error('Failed to get bonus codes');
    }
  }

  /**
   * Get active bonus codes for public display
   */
  static async getActiveBonusCodes(): Promise<ParsedBonusCode[]> {
    return this.getBonusCodes({ 
      isActive: true, 
      expired: false 
    });
  }

  /**
   * Get a specific bonus code by ID
   */
  static async getBonusCodeById(id: string): Promise<ParsedBonusCode | null> {
    try {
      const db = getAdminDb();
      const doc = await db.collection(this.COLLECTION_NAME).doc(id).get();

      if (doc.exists) {
        const data = doc.data();
        return {
          ...data,
          id: doc.id, // Always use the actual Firestore document ID
          createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
          expiresAt: data?.expiresAt?.toDate?.()?.toISOString() || data?.expiresAt
        } as ParsedBonusCode;
      }

      return null;
    } catch (error) {
      console.error('Error getting bonus code:', error);
      throw new Error('Failed to get bonus code');
    }
  }

  /**
   * Update a bonus code
   */
  static async updateBonusCode(updates: UpdateBonusCodeRequest): Promise<void> {
    try {
      const db = getAdminDb();
      const updateData: Record<string, unknown> = {};

      if (updates.isActive !== undefined) {
        updateData.isActive = updates.isActive;
      }

      if (updates.expiresAt) {
        updateData.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
      }

      if (updates.rewardAmount) {
        updateData.rewardAmount = updates.rewardAmount;
      }

      if (updates.wageredRequirement) {
        updateData.wageredRequirement = updates.wageredRequirement;
      }

      if (updates.claimsCount) {
        updateData.claimsCount = updates.claimsCount;
      }

      // First check if the document exists
      const docRef = db.collection(this.COLLECTION_NAME).doc(updates.id);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        throw new Error(`Bonus code with ID ${updates.id} not found`);
      }

      await docRef.update(updateData);
      console.log('Bonus code updated successfully');
    } catch (error) {
      console.error('Error updating bonus code:', error);
      throw new Error('Failed to update bonus code');
    }
  }

  /**
   * Delete a bonus code
   */
  static async deleteBonusCode(id: string): Promise<void> {
    try {
      const db = getAdminDb();
      await db.collection(this.COLLECTION_NAME).doc(id).delete();
      console.log('Bonus code deleted successfully');
    } catch (error) {
      console.error('Error deleting bonus code:', error);
      throw new Error('Failed to delete bonus code');
    }
  }

  /**
   * Check if a bonus code already exists (by code and chat ID)
   */
  static async codeExists(code: string, chatId: number): Promise<boolean> {
    try {
      const db = getAdminDb();
      const snapshot = await db.collection(this.COLLECTION_NAME)
        .where('code', '==', code)
        .where('chatId', '==', chatId)
        .get();
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking if code exists:', error);
      return false;
    }
  }

  /**
   * Get bonus codes by Telegram message ID (to avoid duplicates)
   */
  static async getByTelegramMessageId(chatId: number, messageId: number): Promise<ParsedBonusCode | null> {
    try {
      const db = getAdminDb();
      const snapshot = await db.collection(this.COLLECTION_NAME)
        .where('chatId', '==', chatId)
        .where('telegramMessageId', '==', messageId)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          id: doc.id, // Always use the actual Firestore document ID
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt
        } as ParsedBonusCode;
      }

      return null;
    } catch (error) {
      console.error('Error getting bonus code by Telegram message ID:', error);
      return null;
    }
  }

  /**
   * Clean up expired bonus codes (mark as inactive)
   */
  static async cleanupExpiredCodes(): Promise<number> {
    try {
      // const now = new Date();
      const expiredCodes = await this.getBonusCodes({ expired: true, isActive: true });
      
      let cleanedCount = 0;
      for (const code of expiredCodes) {
        await this.updateBonusCode({ id: code.id, isActive: false });
        cleanedCount++;
      }

      console.log(`Cleaned up ${cleanedCount} expired bonus codes`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
      return 0;
    }
  }
}
