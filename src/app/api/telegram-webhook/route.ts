import { NextRequest } from "next/server";
import { BonusCodeParser } from "@/lib/bonusCodeParser";
import { BonusCodeServiceAdmin } from "@/lib/bonusCodeServiceAdmin";
import { TelegramUpdate, TelegramMessage } from "@/types/bonusCode";

export async function POST(req: NextRequest) {
  try {
    const body: TelegramUpdate = await req.json();
    
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const providedSecret = req.headers.get('x-telegram-bot-api-secret-token');

    if (!webhookSecret || providedSecret !== webhookSecret) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Process the update
    if (body.message) {
      await processMessage(body.message);
    }

    console.log("Telegram webhook processed successfully", body.update_id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function processMessage(message: TelegramMessage) {
  try {
    const allowedChatIdsEnv = process.env.TELEGRAM_ALLOWED_CHAT_IDS || process.env.TELEGRAM_CHAT_ID;
    if (allowedChatIdsEnv) {
      const allowedChatIds = allowedChatIdsEnv.split(',').map(id => id.trim()).filter(Boolean);
      if (!allowedChatIds.includes(message.chat.id.toString())) {
        return;
      }
    }

    const allowedUserIdsEnv = process.env.TELEGRAM_ALLOWED_USER_IDS;
    if (allowedUserIdsEnv) {
      const allowedUserIds = allowedUserIdsEnv.split(',').map(id => id.trim()).filter(Boolean);
      const senderId = message.from?.id?.toString();
      if (!senderId || !allowedUserIds.includes(senderId)) {
        return;
      }
    }

    // Check if this is a bonus code message
    if (!message.text || !BonusCodeParser.isValidBonusCodeMessage(message.text)) {
      return;
    }

    // Check if we've already processed this message
    const existingCode = await BonusCodeServiceAdmin.getByTelegramMessageId(
      message.chat.id, 
      message.message_id
    );

    if (existingCode) {
      return;
    }

    // Parse the message
    const parsedCode = BonusCodeParser.parseMessage(message);
    
    if (!parsedCode) {
      return;
    }

    // Check if code already exists (by code value)
    const codeExists = await BonusCodeServiceAdmin.codeExists(parsedCode.code, message.chat.id);
    
    if (codeExists) {
      return;
    }

    // Save to Firebase
    await BonusCodeServiceAdmin.createBonusCode(parsedCode);
  } catch (error) {
    console.error('Error processing message:', error);
    // Don't throw - we want to acknowledge the webhook even if processing fails
  }
}
