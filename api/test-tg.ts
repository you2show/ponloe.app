import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8257808380:AAGrVLSaXFRntM1gdLSXz3LAEwSAIzuM1G0';
  const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '-1001003526327706';

  try {
    // 1. Test Bot Token Validity
    const meRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const meData = await meRes.json();

    // 2. Test Channel Access
    const chatRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${TELEGRAM_CHANNEL_ID}`);
    const chatData = await chatRes.json();

    res.status(200).json({
      status: "Testing Telegram Connectivity",
      bot_token_used: TELEGRAM_BOT_TOKEN.substring(0, 10) + "...",
      channel_id_used: TELEGRAM_CHANNEL_ID,
      bot_info: meData,
      channel_info: chatData,
      advice: !meData.ok ? "Check your TELEGRAM_BOT_TOKEN in Vercel Environment Variables." : 
              (!chatData.ok ? "Bot is not in the channel or TELEGRAM_CHANNEL_ID is wrong." : "Bot is working correctly!")
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
