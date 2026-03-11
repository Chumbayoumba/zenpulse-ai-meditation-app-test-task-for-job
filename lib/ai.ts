import * as Linking from 'expo-linking';

import { MoodOption } from './types';

const DEFAULT_PROVIDER = 'Pollinations AI';
const DEFAULT_ENDPOINT = 'https://text.pollinations.ai/';
const LOCAL_PROXY_PROVIDER = 'Local AI proxy';
const LOCAL_PROXY_PORT = 8788;

const moodPrompts: Record<MoodOption, string> = {
  calm: 'Write one calm affirmation under 18 words for someone who feels overstimulated.',
  focus: 'Write one focus affirmation under 18 words for someone who feels scattered before deep work.',
  confidence: 'Write one confidence affirmation under 18 words for someone who needs brave steady energy.',
};

const statusMessages: Record<number, string> = {
  400: 'The AI prompt request was rejected. Check the endpoint contract.',
  401: 'The AI service rejected authentication.',
  403: 'The AI service denied access for this app.',
  404: 'The AI endpoint could not be found.',
  429: 'The AI service is rate-limiting requests. Wait a moment and try again.',
  500: 'The AI service hit an internal error. Try again shortly.',
};

function buildPrompt(mood: MoodOption) {
  return `${moodPrompts[mood]} No quotes. No bullet points.`;
}

function tryParseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }
}

function normalizeText(text: string) {
  return text.replace(/^["“]+|["”]+$/g, '').replace(/\s+/g, ' ').trim();
}

function tryParseUrl(rawValue: string) {
  try {
    return new URL(rawValue);
  } catch (error) {
    if (error instanceof TypeError) {
      return null;
    }

    throw error;
  }
}

function isLocalProxyHost(host: string) {
  if (host === 'localhost' || host === '127.0.0.1') {
    return true;
  }

  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return false;
  }

  const [firstOctet, secondOctet] = host.split('.').map(Number);

  return (
    firstOctet === 10 ||
    (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
    (firstOctet === 192 && secondOctet === 168)
  );
}

function resolveAutoProxyEndpoint() {
  if (!__DEV__) {
    return null;
  }

  const appUrl = Linking.createURL('/');
  const parsedUrl = tryParseUrl(appUrl);
  const host = parsedUrl?.hostname;

  if (!host || !isLocalProxyHost(host)) {
    return null;
  }

  return `http://${host}:${LOCAL_PROXY_PORT}/api/affirmation`;
}

function extractText(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return normalizeText(payload);
  }

  if (typeof payload === 'object') {
    const maybePayload = payload as {
      text?: unknown;
      affirmation?: unknown;
      message?: unknown;
      content?: unknown;
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    if (typeof maybePayload.affirmation === 'string') {
      return normalizeText(maybePayload.affirmation);
    }

    if (typeof maybePayload.text === 'string') {
      return normalizeText(maybePayload.text);
    }

    if (typeof maybePayload.message === 'string') {
      return normalizeText(maybePayload.message);
    }

    if (typeof maybePayload.content === 'string') {
      return normalizeText(maybePayload.content);
    }

    const choiceText = maybePayload.choices?.[0]?.message?.content;
    if (typeof choiceText === 'string') {
      return normalizeText(choiceText);
    }
  }

  return null;
}

async function parseResponse(response: Response, provider: string) {
  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(statusMessages[response.status] ?? `AI request failed with status ${response.status}.`);
  }

  const parsed = tryParseJson(rawBody);
  const text = extractText(parsed) ?? extractText(rawBody);

  if (!text) {
    throw new Error(`The ${provider} response was empty or malformed.`);
  }

  if (/important notice|legacy text api|deprecat/i.test(text)) {
    throw new Error(
      'The live provider returned a migration notice instead of meditation copy. Use Expo Go on device or set EXPO_PUBLIC_AI_ENDPOINT to a local proxy.',
    );
  }

  return text;
}

async function fetchFromCustomEndpoint(endpoint: string, mood: MoodOption, provider = 'configured AI endpoint') {
  const prompt = buildPrompt(mood);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app: 'ZenPulse',
      mood,
      prompt,
    }),
  });

  const text = await parseResponse(response, provider);

  return {
    provider,
    text,
  };
}

async function fetchFromPollinations(mood: MoodOption) {
  const prompt = encodeURIComponent(buildPrompt(mood));
  const response = await fetch(`${DEFAULT_ENDPOINT}${prompt}?json=true`);
  const text = await parseResponse(response, DEFAULT_PROVIDER);

  return {
    provider: DEFAULT_PROVIDER,
    text,
  };
}

export async function generateAffirmation(mood: MoodOption) {
  const customEndpoint = process.env.EXPO_PUBLIC_AI_ENDPOINT?.trim();
  const autoProxyEndpoint = resolveAutoProxyEndpoint();

  try {
    if (customEndpoint) {
      return await fetchFromCustomEndpoint(customEndpoint, mood, 'Custom endpoint');
    }

    if (autoProxyEndpoint) {
      try {
        return await fetchFromCustomEndpoint(autoProxyEndpoint, mood, LOCAL_PROXY_PROVIDER);
      } catch {
        // Fall through to the public demo provider when the local proxy is not running.
      }
    }

    return await fetchFromPollinations(mood);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'The AI request could not reach the network. Check your connection or set EXPO_PUBLIC_AI_ENDPOINT to a reachable service.',
      );
    }

    throw error;
  }
}

export function getAiModeLabel() {
  if (process.env.EXPO_PUBLIC_AI_ENDPOINT?.trim()) {
    return 'Custom endpoint';
  }

  return resolveAutoProxyEndpoint() ? 'Auto local proxy / live demo' : 'Live Pollinations demo';
}
