import { IMPRESSION_TAGS, MAX_INPUT_LENGTH, MIN_INPUT_LENGTH } from './types';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * ユーザーの自由入力テキストを検証する。
 * クライアント側・サーバー側の両方で同じロジックを使う。
 */
export function validateFreeText(raw: unknown): ValidationResult {
  if (typeof raw !== 'string') {
    return { valid: false, message: '入力内容を確認してください。' };
  }

  const text = raw.trim();

  if (text.length === 0) {
    return { valid: false, message: '感想を入力してください。' };
  }

  if (text.length < MIN_INPUT_LENGTH) {
    return {
      valid: false,
      message: 'もう少し具体的な感想を入力してください。',
    };
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      message: `入力できる文字数は${MAX_INPUT_LENGTH}文字までです。`,
    };
  }

  return { valid: true };
}

/**
 * 選択されたタグ（印象に残った項目）を検証する。
 * 許可リストにない値は取り除き、数を制限する。
 */
export function sanitizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const allowed = new Set<string>(IMPRESSION_TAGS as readonly string[]);
  const result: string[] = [];

  for (const item of raw) {
    if (typeof item === 'string' && allowed.has(item) && !result.includes(item)) {
      result.push(item);
    }
    if (result.length >= IMPRESSION_TAGS.length) break;
  }

  return result;
}

/**
 * 制御文字などを除去する簡易サニタイズ。
 * 表示はReact/textareaが自動エスケープするため主にログ・API送信向けの防御。
 */
export function stripControlChars(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}
