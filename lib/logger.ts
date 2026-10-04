/**
 * 開発者向けのログ出力。
 * お客様の入力内容や生成された口コミ文章は絶対にログへ残さない。
 * 残すのはエラー種別・ステータスコード・時刻程度のみ。
 */
export function logServerError(context: string, detail?: Record<string, unknown>) {
  const safeDetail = detail ?? {};
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: 'error',
      context,
      time: new Date().toISOString(),
      ...safeDetail,
    })
  );
}
