import { NextRequest } from "next/server";
import { BonusCodeParser } from "@/lib/bonusCodeParser";
import { BonusCodeServiceAdmin } from "@/lib/bonusCodeServiceAdmin";
import { TelegramUpdate, TelegramMessage } from "@/types/bonusCode";

export async function POST(req: NextRequest) {
  try {
    const body: TelegramUpdate = await req.json();
    
    // Validate webhook secret if configured
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = req.headers.get('x-telegram-bot-api-secret-token');
      if (providedSecret !== webhookSecret) {
        console.log('Invalid webhook secret');
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
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
    // Check if we should filter by chat ID
    const allowedChatId = process.env.TELEGRAM_CHAT_ID;
    if (allowedChatId && message.chat.id.toString() !== allowedChatId) {
      console.log(`Message from chat ${message.chat.id} ignored (not in allowed chat ${allowedChatId})`);
      return;
    }

    // Check if this is a bonus code message
    if (!message.text || !BonusCodeParser.isValidBonusCodeMessage(message.text)) {
      console.log('Message is not a valid bonus code message');
      return;
    }

    // Check if we've already processed this message
    const existingCode = await BonusCodeServiceAdmin.getByTelegramMessageId(
      message.chat.id, 
      message.message_id
    );

    if (existingCode) {
      console.log('Bonus code already exists for this message');
      return;
    }

    // Parse the message
    const parsedCode = BonusCodeParser.parseMessage(message);
    
    if (!parsedCode) {
      console.log('Failed to parse bonus code from message');
      return;
    }

    // Check if code already exists (by code value)
    const codeExists = await BonusCodeServiceAdmin.codeExists(parsedCode.code, message.chat.id);
    
    if (codeExists) {
      console.log('Bonus code already exists:', parsedCode.code);
      return;
    }

    // Save to Firebase
    const codeId = await BonusCodeServiceAdmin.createBonusCode(parsedCode);
    console.log('Bonus code saved successfully:', codeId, parsedCode.code);

    // Optional: Send confirmation to admin or log success
    // You could add notification logic here

  } catch (error) {
    console.error('Error processing message:', error);
    // Don't throw - we want to acknowledge the webhook even if processing fails
  }
}


