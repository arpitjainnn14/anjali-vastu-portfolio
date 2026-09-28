#!/usr/bin/env node
/**
 * Telegram alert helper. Reads TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID from
 * .dev.vars (the same file wrangler uses) and never prints the token.
 *
 *   node scripts/telegram.mjs chat-id   list chats that have messaged the bot
 *   node scripts/telegram.mjs test      send a mock booking and a mock message
 */
import { readFileSync } from 'node:fs';

function loadVars() {
  const vars = {};
  try {
    for (const line of readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (match) vars[match[1]] = match[2];
    }
  } catch {
    /* No .dev.vars yet. */
  }
  return { ...vars, ...process.env };
}

const env = loadVars();
const token = env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Add TELEGRAM_BOT_TOKEN=… to .dev.vars first (from @BotFather).');
  process.exit(1);
}
const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  }).then((r) => r.json());

const command = process.argv[2];

if (command === 'chat-id') {
  const result = await api('getUpdates');
  if (!result.ok) {
    console.error('Telegram refused the token. Check TELEGRAM_BOT_TOKEN.');
    process.exit(1);
  }
  const chats = new Map();
  for (const update of result.result) {
    const chat = update.message?.chat;
    if (chat) chats.set(chat.id, [chat.first_name, chat.last_name, chat.username && `@${chat.username}`].filter(Boolean).join(' '));
  }
  if (chats.size === 0) {
    console.log('No messages yet. Open the bot in Telegram, press Start (or send "hi"), then run this again.');
  } else {
    for (const [id, name] of chats) console.log(`TELEGRAM_CHAT_ID=${id}   (${name})`);
  }
} else if (command === 'test') {
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    console.error('Add TELEGRAM_CHAT_ID=… to .dev.vars first (node scripts/telegram.mjs chat-id).');
    process.exit(1);
  }
  const messages = [
    [
      '🧪 <b>Test alert</b> (not a real booking)',
      '',
      '🗓️ <b>New booking</b>',
      '<b>Service:</b> Vedic Astrology',
      '<b>When:</b> Tue, 30 Sept, 11:00 am',
      '<b>Name:</b> Ravi Kumar',
      '<b>Phone:</b> +91 98100 00000',
      '<b>Where:</b> Palwal',
      '<b>Fee:</b> ₹2151 (paid)',
    ].join('\n'),
    [
      '🧪 <b>Test alert</b> (not a real message)',
      '',
      '📩 <b>New message from the website</b>',
      '<b>Name:</b> Sunita Sharma',
      '<b>Phone:</b> 98100 00001',
      '<b>Topic:</b> Vastu for a home or shop',
      '',
      '<b>Question:</b>\nWe are building a house in Faridabad. Can you check the plan?',
    ].join('\n'),
  ];
  for (const text of messages) {
    const result = await api('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
    console.log(result.ok ? 'Sent ✓' : `Telegram said: ${result.description}`);
  }
} else {
  console.log('Usage: node scripts/telegram.mjs chat-id | test');
}
