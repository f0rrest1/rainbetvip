import { NextRequest, NextResponse } from "next/server";
import { BonusCodeServiceAdmin } from "@/lib/bonusCodeServiceAdmin";
import { withAdminAuth, AuthenticatedUser } from "@/lib/auth";
import { validateAndSanitize, sanitizeError, CreateBonusCodeSchema, BonusCodeFiltersSchema } from "@/lib/validation";

export const GET = async (req: NextRequest) => {
  try {
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
  } catch (error) {
    console.error('Error fetching bonus codes:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(async (req: NextRequest, _user: AuthenticatedUser) => {
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
