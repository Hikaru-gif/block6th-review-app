import ReviewAssistant from '@/components/ReviewAssistant';

export default function Home() {
  // GOOGLE_REVIEW_URL はサーバー側の環境変数から読み込み、
  // クライアントコンポーネントへはpropsとして渡す（コードへのハードコード禁止のため）。
  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL || null;

  return <ReviewAssistant googleReviewUrl={googleReviewUrl} />;
}
