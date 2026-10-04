/**
 * 簡易レート制限（IPベース、メモリ上で管理）。
 *
 * 【重要な注意点（READMEにも記載）】
 * Vercelなどのサーバーレス環境では、実行インスタンスが複数に分散されたり
 * 再起動されたりするため、このメモリ上のカウンタは「厳密な」制限にはなりません。
 * あくまで「明らかな連打・大量アクセスを緩和するための簡易対策」です。
 * より厳密な制限が必要な場合は、Vercelの機能や外部サービスの導入を検討してください。
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// 呼び出しが増えすぎてメモリを圧迫しないよう、一定数を超えたら古いものから掃除する
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    cleanupIfNeeded(now, windowMs);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: maxRequests - existing.count };
}

function cleanupIfNeeded(now: number, windowMs: number) {
  if (buckets.size <= MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > windowMs) {
      buckets.delete(key);
    }
  }
}

/**
 * リクエストヘッダーからクライアントのIPアドレスらしき値を取り出す。
 * 取得できない場合は 'unknown' とし、その場合は全員が同じバケットになる点に注意。
 */
export function getClientKey(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
