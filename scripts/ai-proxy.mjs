import http from 'node:http';

const port = Number(process.env.AI_PROXY_PORT ?? 8788);

function buildProxyPrompt(mood, prompt) {
  if (typeof prompt === 'string' && prompt.trim().length > 0 && prompt.trim().length < 180) {
    return prompt.trim();
  }

  const fallbackPrompts = {
    calm: 'Write one calm affirmation under 18 words for someone who feels overstimulated. No quotes.',
    focus: 'Write one focus affirmation under 18 words for someone who feels scattered before deep work. No quotes.',
    confidence: 'Write one confidence affirmation under 18 words for someone who needs brave steady energy. No quotes.',
  };

  return fallbackPrompts[mood] ?? fallbackPrompts.calm;
}

function normalizeText(text) {
  return text.replace(/^["“]+|["”]+$/g, '').replace(/\s+/g, ' ').trim();
}

function extractText(payload) {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return normalizeText(payload);
  }

  if (typeof payload === 'object') {
    if (typeof payload.affirmation === 'string') {
      return normalizeText(payload.affirmation);
    }

    if (typeof payload.text === 'string') {
      return normalizeText(payload.text);
    }

    if (typeof payload.message === 'string') {
      return normalizeText(payload.message);
    }

    if (typeof payload.content === 'string') {
      return normalizeText(payload.content);
    }
  }

  return null;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

async function parseJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');

  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: 'Missing request URL.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true });
    return;
  }

  const { pathname } = new URL(request.url, `http://127.0.0.1:${port}`);

  if (request.method !== 'POST' || pathname !== '/api/affirmation') {
    sendJson(response, 404, { error: 'Not found.' });
    return;
  }

  try {
    const body = await parseJsonBody(request);
    const mood = typeof body.mood === 'string' ? body.mood : 'calm';
    const prompt = buildProxyPrompt(mood, body.prompt);
    const upstream = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?json=true`);
    const raw = await upstream.text();

    if (!upstream.ok) {
      sendJson(response, upstream.status, { error: `Upstream provider returned ${upstream.status}.`, details: raw });
      return;
    }

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }

    const text = extractText(parsed) ?? extractText(raw);

    if (!text || /important notice|legacy text api|deprecat/i.test(text)) {
      sendJson(response, 502, {
        error: 'Upstream provider returned a migration notice instead of generated text.',
        details: raw,
      });
      return;
    }

    sendJson(response, 200, {
      provider: 'Local Pollinations proxy',
      text,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Unexpected proxy error.',
    });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`ZenPulse AI proxy listening on http://0.0.0.0:${port}/api/affirmation`);
});
