export const IMPRESSION_TAGS = [
  '料理',
  'ドリンク',
  '店内の雰囲気',
  '接客',
  '価格',
  '居心地',
  'その他',
] as const;

export type ImpressionTag = (typeof IMPRESSION_TAGS)[number];

export interface GenerateRequestBody {
  tags: string[];
  text: string;
}

export interface GenerateSuccessResponse {
  ok: true;
  text: string;
}

export interface GenerateErrorResponse {
  ok: false;
  error: string;
}

export type GenerateResponse = GenerateSuccessResponse | GenerateErrorResponse;

export const MIN_INPUT_LENGTH = 10;
export const MAX_INPUT_LENGTH = 1000;
