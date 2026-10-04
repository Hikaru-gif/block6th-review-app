import { NextRequest, NextResponse } from 'next/server';
import { generateReviewText } from '@/lib/openai';
import { logServerError } from '@/lib/logger';
import { checkRateLimit, getClientKey } from '@/lib/rateLimit';
import { sanitizeTags, stripControlChars, validateFreeText } from '@/lib/validation';
import type { GenerateResponse } from '@/lib/types';

export const runtime = 'nodejs';

const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 8);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 10 * 60 * 1000);

function jsonError(message: string, status: number): NextResponse<GenerateResponse> {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  // --- レート制限（簡易・IPベース） ---
  const clientKey = getClientKey(req.headers);
  const rate = checkRateLimit(clientKey, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
  if (!rate.allowed) {
    return jsonError(
      'アクセスが集中しています。少し時間をおいてからもう一度お試しください。',
      429
    );
  }

  // --- リクエストボディの検証 ---
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('入力内容を確認してください。', 400);
  }

  if (typeof body !== 'object' || body === null) {
    return jsonError('入力内容を確認してください。', 400);
  }

  const rawText = (body as Record<string, unknown>).text;
  const rawTags = (body as Record<string, unknown>).tags;

  const textValidation = validateFreeText(rawText);
  if (!textValidation.valid) {
    return jsonError(textValidation.message ?? '入力内容を確認してください。', 400);
  }

  const text = stripControlChars((rawText as string).trim());
  const tags = sanitizeTags(rawTags);

  // --- APIキー確認 ---
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logServerError('missing_api_key');
    return jsonError(
      '現在、口コミ文章の作成機能をご利用いただけません。店舗スタッフにお問い合わせください。',
      500
    );
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // --- AI呼び出し ---
  try {
    const result = await generateReviewText({ tags, text, apiKey, model });

    if (!result.ok || !result.text) {
      logServerError('generation_failed', { errorType: result.errorType ?? 'unknown' });

      if (result.errorType === 'auth') {
        return jsonError(
          '現在、口コミ文章の作成機能をご利用いただけません。店舗スタッフにお問い合わせください。',
          500
        );
      }

      return jsonError('文章の作成に失敗しました。もう一度お試しください。', 502);
    }

    return NextResponse.json({ ok: true, text: result.text }, { status: 200 });
  } catch (err) {
    logServerError('unexpected_error', {
      name: err instanceof Error ? err.name : 'unknown',
    });
    return jsonError('文章の作成に失敗しました。もう一度お試しください。', 500);
  }
}

// GETなど他のメソッドは許可しない
export async function GET() {
  return jsonError('このエンドポイントはPOSTのみ対応しています。', 405);
}
