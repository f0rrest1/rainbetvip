import { NextRequest, NextResponse } from "next/server";
import { BonusCodeServiceAdmin } from "@/lib/bonusCodeServiceAdmin";
import { withAdminAuth, AuthenticatedUser, authenticateRequest, requireAdmin } from "@/lib/auth";
import { validateAndSanitize, sanitizeError, CreateBonusCodeSchema, BonusCodeFiltersSchema } from "@/lib/validation";

async function isAdminRequest(req: NextRequest): Promise<boolean> {
  try {
    const user = await authenticateRequest(req);
    requireAdmin(user);
    return true;
  } catch {
    return false;
  }
}

export const GET = async (req: NextRequest) => {
  try {
    const adminRequest = await isAdminRequest(req);

    if (adminRequest) {
      const { searchParams } = new URL(req.url);

      // Parse and validate query parameters for filtering
      const rawFilters: Record<string, unknown> = {};

      if (searchParams.get('isActive') !== null) {
        rawFilters.isActive = searchParams.get('isActive') === 'true';
      }

      if (searchParams.get('messageType')) {
        rawFilters.messageType = searchParams.get('messageType');
      }

      if (searchParams.get('source')) {
        rawFilters.source = searchParams.get('source');
      }

      if (searchParams.get('expired') !== null) {
        rawFilters.expired = searchParams.get('expired') === 'true';
      }

      const filters = validateAndSanitize(BonusCodeFiltersSchema, rawFilters);
      const bonusCodes = await BonusCodeServiceAdmin.getBonusCodes(filters);

      return NextResponse.json({
        success: true,
        data: bonusCodes
      });
    }

    // Public path: only return active, non-expired codes with sanitized fields
    const activeCodes = await BonusCodeServiceAdmin.getBonusCodes({ isActive: true, expired: false });
    const now = new Date();
    const sanitized = activeCodes
      .filter(code => !code.expiresAt || new Date(code.expiresAt) >= now)
      .map(code => ({
        code: code.code,
        rewardAmount: code.rewardAmount,
        wageredRequirement: code.wageredRequirement,
        claimsCount: code.claimsCount,
        messageType: code.messageType,
        expiresAt: code.expiresAt,
      }));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('Error fetching bonus codes:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(async (req: NextRequest, _user: AuthenticatedUser) => {
  void _user;
  try {
    const rawBody = await req.json();

    // Validate and sanitize input data
    const validatedData = validateAndSanitize(CreateBonusCodeSchema, rawBody);

    // Create the bonus code with validated data
    const bonusCode = {
      code: validatedData.code,
      rewardAmount: validatedData.rewardAmount.toString(),
      wageredRequirement: validatedData.wageredRequirement.toString(),
      claimsCount: validatedData.claimsCount.toString(),
      expiryDuration: validatedData.expiryDuration.toString(),
      messageType: validatedData.messageType,
      originalMessage: `Manual entry by admin: ${validatedData.code}`,
      telegramMessageId: 0,
      chatId: 0,
      createdAt: new Date().toISOString(),
      expiresAt: validatedData.expiresAt,
      isActive: true,
      source: 'manual' as const
    };

    const codeId = await BonusCodeServiceAdmin.createBonusCode(bonusCode);

    return NextResponse.json({
      success: true,
      data: { id: codeId, ...bonusCode }
    });
  } catch (error) {
    console.error('Error creating bonus code:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500 }
    );
  }
});
