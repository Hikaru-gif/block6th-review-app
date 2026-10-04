import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーについて | BLOCK 6th',
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col px-5 pb-12 pt-10">
      <h1 className="font-serif text-2xl text-white">プライバシーについて</h1>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-white/80">
        <p>
          このページは、BLOCK 6thにご来店いただいたお客様が、Google口コミ用の文章を作成するための
          サポートツールです。
        </p>
        <p>入力していただいた感想は、口コミ文章を作成する目的にのみ使用します。</p>
        <p>
          お名前・電話番号・メールアドレスなどの個人情報は収集していません。入力欄にもこれらの情報を
          入力しないようお願いいたします。
        </p>
        <p>
          入力内容や作成された文章は、サーバー上のデータベースに保存されません。文章の作成処理が終わると
          破棄されます。
        </p>
        <p>
          文章の作成には外部のAIサービス（OpenAI API）を利用しています。入力いただいた内容は、文章生成の
          ためにAIサービスへ送信されます。
        </p>
        <p>
          Google口コミへの投稿はお客様ご自身の判断で行っていただくものであり、このツールが投稿を
          代行することはありません。
        </p>
      </div>

      <Link href="/" className="mt-10 text-center text-sm text-white/45 underline underline-offset-4">
        トップページへ戻る
      </Link>
    </main>
  );
}
