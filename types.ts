export type Language = 'en' | 'zh';

export type AspectRatioValue = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface AspectRatio {
  value: AspectRatioValue;
  label_en: string;
  label_zh: string;
}

export interface Template {
  id: string;
  name_en: string;
  name_zh: string;
  thumbnail: string;
  prompt_en: string;
  prompt_zh: string;
}

export interface Category {
  id:string;
  name_en: string;
  name_zh: string;
  templates: Template[];
}

export interface GeneratedAd {
    type: 'image' | 'video';
    url: string | null;
    text: string | null;
}

export interface VideoStyle {
  id: string;
  name_en: string;
  name_zh: string;
  prompt_en: string;
  prompt_zh: string;
}

export interface User {
  email: string;
  company?: string;
  school?: string;
  industry?: string;
  phone?: string;
}

export interface RegistrationData extends User {
  password?: string;
}