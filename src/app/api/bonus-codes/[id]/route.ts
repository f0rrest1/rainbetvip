import { NextRequest, NextResponse } from "next/server";
import { BonusCodeServiceAdmin } from "@/lib/bonusCodeServiceAdmin";
// Removed unused import
import { withAuth, withAdminAuth, AuthenticatedUser } from "@/lib/auth";
import { validateAndSanitize, sanitizeError, UpdateBonusCodeSchema } from "@/lib/validation";

export const GET = withAuth(async (
  req: NextRequest,
  user: AuthenticatedUser,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const bonusCode = await BonusCodeServiceAdmin.getBonusCodeById(id);

    if (!bonusCode) {
      return NextResponse.json(
        { success: false, error: 'Bonus code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bonusCode
    });
  } catch (error) {
    console.error('Error fetching bonus code:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500 }
    );
  }
});

export const PUT = withAdminAuth(async (
  req: NextRequest,
  user: AuthenticatedUser,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const rawBody = await req.json();

    const validatedData = validateAndSanitize(UpdateBonusCodeSchema, {
      id,
      ...rawBody
    });

    // Convert numeric fields to strings for the service
    const updateData = {
      ...validatedData,
      rewardAmount: validatedData.rewardAmount?.toString(),
      wageredRequirement: validatedData.wageredRequirement?.toString(),
      claimsCount: validatedData.claimsCount?.toString()
    };

    await BonusCodeServiceAdmin.updateBonusCode(updateData);

    return NextResponse.json({
      success: true,
      message: 'Bonus code updated successfully'
    });
  } catch (error) {
    console.error('Error updating bonus code:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500 }
    );
  }
});

export const DELETE = withAdminAuth(async (
  req: NextRequest,
  user: AuthenticatedUser,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid bonus code ID' },
        { status: 400 }
      );
    }

    await BonusCodeServiceAdmin.deleteBonusCode(id);

    return NextResponse.json({
      success: true,
      message: 'Bonus code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bonus code:', error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500 }
    );
  }
});
