'use client';

import { useMemo, useRef, useState } from 'react';
import { IMPRESSION_TAGS, MAX_INPUT_LENGTH, MIN_INPUT_LENGTH } from '@/lib/types';
import type { GenerateResponse } from '@/lib/types';

type Step = 'input' | 'result';

interface Props {
  googleReviewUrl: string | null;
}

// タグごとの入力例（プレースホルダー用）。
// あくまで「こう書くと伝わりやすい」という例を見せるだけで、
// 実際の文章化にはお客様が自由入力欄に書いた内容だけを使う。
const TAG_PLACEHOLDER_HINTS: Record<string, string> = {
  料理: '料理が美味しかった',
  ドリンク: 'ドリンクも美味しかった',
  店内の雰囲気: '古民家っぽい雰囲気が良かった',
  接客: '店員さんの対応が良かった',
  価格: '価格がちょうど良いと感じた',
  居心地: '居心地が良くてゆっくりできた',
  その他: '印象に残ったことがあった',
};

const DEFAULT_PLACEHOLDER =
  '例：古民家っぽい雰囲気が良かった。高崎レモンサワーも美味しかった。料理も美味しかった。';

function buildPlaceholder(selectedTags: string[]): string {
  if (selectedTags.length === 0) return DEFAULT_PLACEHOLDER;

  const hints = selectedTags
    .map((tag) => TAG_PLACEHOLDER_HINTS[tag])
    .filter((hint): hint is string => Boolean(hint));

  if (hints.length === 0) return DEFAULT_PLACEHOLDER;

  return `例：${hints.join('。')}。（実際に感じたことを自由に書いてください）`;
}

export default function ReviewAssistant({ googleReviewUrl }: Props) {
  const [step, setStep] = useState<Step>('input');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const submittingRef = useRef(false);

  const trimmedLength = freeText.trim().length;
  const remaining = MAX_INPUT_LENGTH - freeText.length;
  const dynamicPlaceholder = useMemo(() => buildPlaceholder(selectedTags), [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    if (trimmedLength === 0) {
      setInputError('感想を入力してください。');
      return;
    }
    if (trimmedLength < MIN_INPUT_LENGTH) {
      setInputError('もう少し具体的な感想を入力してください。');
      return;
    }
    if (freeText.length > MAX_INPUT_LENGTH) {
      setInputError(`入力できる文字数は${MAX_INPUT_LENGTH}文字までです。`);
      return;
    }

    setInputError(null);
    setGenError(null);
    setLoading(true);
    submittingRef.current = true;

    try {
      const res = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: selectedTags, text: freeText.trim() }),
      });

      let data: GenerateResponse | null = null;
      try {
        data = (await res.json()) as GenerateResponse;
      } catch {
        data = null;
      }

      if (!res.ok || !data || !data.ok) {
        const message =
          data && 'error' in data && data.error
            ? data.error
            : '文章の作成に失敗しました。もう一度お試しください。';
        setGenError(message);
        return;
      }

      setGeneratedText(data.text);
      setCopyStatus('idle');
      setStep('result');
    } catch {
      setGenError('通信に失敗しました。電波の良い場所でもう一度お試しください。');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleCopy = async () => {
    const text = generatedText;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopyStatus('success');
        return;
      }
      throw new Error('clipboard api unavailable');
    } catch {
      // フォールバック: 非表示テキストエリア経由でコピー
      try {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'fixed';
        el.style.top = '-1000px';
        el.style.left = '-1000px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(el);
        setCopyStatus(successful ? 'success' : 'failed');
      } catch {
        setCopyStatus('failed');
      }
    }
  };

  const handleOpenGoogle = () => {
    if (!googleReviewUrl) return;
    window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRestart = () => {
    setStep('input');
    setGeneratedText('');
    setCopyStatus('idle');
    setGenError(null);
  };

  const charCountClass = useMemo(() => {
    if (remaining < 0) return 'text-red-400';
    if (remaining < 50) return 'text-brass-400';
    return 'text-white/40';
  }, [remaining]);

  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col px-5 pb-12 pt-10">
      {step === 'input' ? (
        <>
          <header className="mb-8 text-center">
            <p className="font-serif text-3xl tracking-wide text-white">BLOCK 6th</p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/80">
              ご来店ありがとうございました。
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-white/80">
              今日の感想を、自然な口コミ文章にできます。
            </p>
          </header>

          <section className="mb-7">
            <h2 className="mb-3 text-[15px] font-medium text-white/90">
              どんなところが印象に残りましたか？
              <span className="ml-2 text-xs font-normal text-white/40">（複数選択可・任意）</span>
            </h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="印象に残った項目">
              {IMPRESSION_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                      active
                        ? 'border-brass-400 bg-brass-400/15 text-brass-400'
                        : 'border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-6">
            <label htmlFor="free-text" className="mb-3 block text-[15px] font-medium text-white/90">
              今日の感想を自由に入力してください
            </label>
            <textarea
              id="free-text"
              value={freeText}
              onChange={(e) => {
                setFreeText(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder={dynamicPlaceholder}
              rows={7}
              maxLength={MAX_INPUT_LENGTH + 200}
              className="w-full resize-none rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus:border-brass-400"
              aria-describedby="free-text-count free-text-error"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span id="free-text-count" className={charCountClass}>
                {freeText.length} / {MAX_INPUT_LENGTH}文字
              </span>
            </div>
            {inputError && (
              <p
                id="free-text-error"
                role="alert"
                className="mt-2 rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300"
              >
                {inputError}
              </p>
            )}
          </section>

          {genError && (
            <div role="alert" className="mb-5 rounded-lg bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {genError}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-brass-400 py-4 text-[16px] font-medium text-ink-950 transition-opacity disabled:opacity-50"
          >
            {loading ? 'AIが文章を作成しています…' : '口コミ文章を作る'}
          </button>

          <p className="mt-6 text-center text-xs leading-relaxed text-white/35">
            入力された内容は口コミ文章の作成のみに使用します。
            <br />
            お名前・電話番号・メールアドレスなど個人情報は入力しないでください。
          </p>
          <a
            href="/privacy"
            className="mt-3 block text-center text-xs text-white/35 underline underline-offset-4"
          >
            プライバシーについて
          </a>
        </>
      ) : (
        <>
          <header className="mb-6 text-center">
            <p className="font-serif text-2xl tracking-wide text-white">BLOCK 6th</p>
            <p className="mt-3 text-[15px] text-white/80">こんな口コミはいかがですか？</p>
          </header>

          <section className="mb-5">
            <label htmlFor="result-text" className="sr-only">
              生成された口コミ文章（編集できます）
            </label>
            <textarea
              id="result-text"
              value={generatedText}
              onChange={(e) => {
                setGeneratedText(e.target.value);
                if (copyStatus !== 'idle') setCopyStatus('idle');
              }}
              rows={8}
              maxLength={MAX_INPUT_LENGTH + 200}
              className="w-full resize-none rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-[15px] leading-relaxed text-white focus:border-brass-400"
            />
            <p className="mt-2 text-xs text-white/40">文章は自由に編集できます。</p>
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full rounded-2xl border border-white/25 py-4 text-[16px] font-medium text-white"
            >
              文章をコピー
            </button>

            {copyStatus === 'success' && (
              <p role="status" className="text-center text-sm text-brass-400">
                口コミ文章をコピーしました
              </p>
            )}
            {copyStatus === 'failed' && (
              <p role="alert" className="text-center text-sm text-red-300">
                コピーに失敗しました。文章を長押しして選択・コピーしてください。
              </p>
            )}

            {googleReviewUrl ? (
              <button
                type="button"
                onClick={handleOpenGoogle}
                className="w-full rounded-2xl bg-brass-400 py-4 text-[16px] font-medium text-ink-950"
              >
                Google口コミを書く
              </button>
            ) : (
              <p role="alert" className="rounded-lg bg-red-950/40 px-4 py-3 text-center text-sm text-red-300">
                Google口コミページの設定が完了していません。店舗スタッフへお問い合わせください。
              </p>
            )}

            <button
              type="button"
              onClick={handleRestart}
              className="mt-1 w-full py-2 text-center text-sm text-white/45 underline underline-offset-4"
            >
              はじめから入力し直す
            </button>
          </div>
        </>
      )}
    </main>
  );
}
