import { z } from 'zod';

/**
 * Validation schemas for API inputs
 */

// Helper function to extract numeric value from various input formats
const extractNumericValue = (input: string): number => {
  // Remove common units, currency symbols, and extract first number
  const cleaned = input
    .replace(/hours?|hrs?|days?|weeks?|months?/gi, '') // Remove time units
    .replace(/[$,\s]/g, ' ') // Remove currency symbols and commas
    .replace(/[^\d.-]/g, ' ') // Replace non-numeric chars with spaces
    .trim()
    .split(/\s+/)[0]; // Get first number
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const CreateBonusCodeSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),

  rewardAmount: z.string()
    .min(1, 'Reward amount is required')
    .transform((val) => extractNumericValue(val))
    .refine((val) => val > 0, 'Reward amount must be a positive number')
    .refine((val) => val <= 10000, 'Reward amount cannot exceed 10,000'),

  wageredRequirement: z.string()
    .min(1, 'Wagered requirement is required')
    .transform((val) => extractNumericValue(val))
    .refine((val) => val > 0, 'Wagered requirement must be a positive number')
    .refine((val) => val <= 100000, 'Wagered requirement cannot exceed 100,000'),

  claimsCount: z.string()
    .min(1, 'Claims count is required')
    .transform((val) => Math.floor(extractNumericValue(val)))
    .refine((val) => val > 0, 'Claims count must be a positive integer')
    .refine((val) => val <= 10000, 'Claims count cannot exceed 10,000'),

  expiryDuration: z.string()
    .min(1, 'Expiry duration is required')
    .transform((val) => {
      const num = extractNumericValue(val);
      // Convert to hours if input contains time units
      if (val.toLowerCase().includes('day')) return num * 24;
      if (val.toLowerCase().includes('week')) return num * 24 * 7;
      if (val.toLowerCase().includes('month')) return num * 24 * 30;
      return num; // Default to hours
    })
    .refine((val) => val > 0, 'Expiry duration must be a positive number')
    .refine((val) => val <= 8760, 'Expiry duration cannot exceed 8760 hours (1 year)'),

  messageType: z.enum(['Rainbet Bonus', 'Rainbet Vip Bonus']),

  expiresAt: z.string()
    .min(1, 'Expiry date is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Expiry date must be a valid future date')
});

export const UpdateBonusCodeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  isActive: z.boolean().optional(),
  rewardAmount: z.string().min(1, 'Reward amount is required').transform((val) => parseFloat(val)).refine((val) => val > 0, 'Reward amount must be a positive number').refine((val) => val <= 10000, 'Reward amount cannot exceed 10,000').optional(),
  wageredRequirement: z.string().min(1, 'Wagered requirement is required').transform((val) => parseFloat(val)).refine((val) => val > 0, 'Wagered requirement must be a positive number').refine((val) => val <= 100000, 'Wagered requirement cannot exceed 100,000').optional(),
  claimsCount: z.string().min(1, 'Claims count is required').transform((val) => parseInt(val)).refine((val) => val > 0, 'Claims count must be a positive integer').refine((val) => val <= 10000, 'Claims count cannot exceed 10,000').optional(),
  expiresAt: z.string().datetime().optional()
}).refine(
  (data) => Object.keys(data).length > 1,
  'At least one field to update must be provided'
);

export const BonusCodeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  messageType: z.enum(['Rainbet Bonus', 'Rainbet Vip Bonus']).optional(),
  source: z.enum(['telegram', 'manual']).optional(),
  expired: z.boolean().optional()
});

export const SiteSettingsSchema = z.object({
  socialLinks: z.object({
    discord: z.object({
      url: z.string().optional().or(z.string().url('Invalid Discord URL')),
      visible: z.boolean()
    }),
    instagram: z.object({
      url: z.string().optional().or(z.string().url('Invalid Instagram URL')),
      visible: z.boolean()
    }),
    youtube: z.object({
      url: z.string().optional().or(z.string().url('Invalid YouTube URL')),
      visible: z.boolean()
    }),
    twitter: z.object({
      url: z.string().optional().or(z.string().url('Invalid Twitter URL')),
      visible: z.boolean()
    })
  }),
  trackingPixel: z.object({
    url: z.string().optional().or(z.string().url('Invalid tracking pixel URL')),
    enabled: z.boolean()
  }),
  heroContent: z.object({
    mainHeading: z.string()
      .optional()
      .or(z.string().max(200, 'Main heading must be less than 200 characters')),
    subHeading: z.string()
      .optional()
      .or(z.string().max(200, 'Sub heading must be less than 200 characters')),
    statusBadge: z.string()
      .optional()
      .or(z.string().max(100, 'Status badge text must be less than 100 characters')),
    description: z.string()
      .optional()
      .or(z.string().max(500, 'Description must be less than 500 characters')),
    bonusMessage: z.string()
      .optional()
      .or(z.string().max(200, 'Bonus message must be less than 200 characters'))
  }),
  floatingBoxes: z.array(z.object({
    id: z.string().min(1, 'Box ID is required'),
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
    badge: z.string().min(1, 'Badge is required').max(50, 'Badge must be less than 50 characters'),
    color: z.string().min(1, 'Color is required'),
    visible: z.boolean()
  })).optional()
});

export type CreateBonusCodeInput = z.infer<typeof CreateBonusCodeSchema>;
export type UpdateBonusCodeInput = z.infer<typeof UpdateBonusCodeSchema>;
export type BonusCodeFiltersInput = z.infer<typeof BonusCodeFiltersSchema>;
export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;

/**
 * Validate and sanitize input data
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues?.map(err => `${err.path.join('.')}: ${err.message}`) || ['Unknown validation error'];
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return result.data;
}

/**
 * Sanitize error messages to prevent information disclosure
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Only return safe error messages
    if (error.message.includes('Validation failed') ||
        error.message.includes('Authentication failed') ||
        error.message.includes('Admin access required')) {
      return error.message;
    }
  }

  return 'An error occurred while processing your request';
}