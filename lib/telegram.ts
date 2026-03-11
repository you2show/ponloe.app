export const getTelegramUpdates = async (offset?: number) => {
  try {
    const offsetParam = offset ? `?offset=${offset}` : '';
    const res = await fetch(`/api/telegram/updates${offsetParam}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching Telegram updates:', error);
    return { ok: false, result: [] };
  }
};

export const sendTelegramMessage = async (chatId: number, text: string) => {
  try {
    const res = await fetch(`/api/telegram/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text })
    });
    return await res.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { ok: false };
  }
};
