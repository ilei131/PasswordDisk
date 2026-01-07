import { useState, useEffect } from 'react';
import en from './locales/en.json';
import zh from './locales/zh.json';

// 支持的语言类型
export type Language = 'en' | 'zh';

// 翻译资源类型
type TranslationResources = typeof en;

// 翻译函数类型
type TranslateFunction = (key: string, params?: Record<string, string>) => string;

// 语言资源映射
const resources: Record<Language, TranslationResources> = {
  en,
  zh: zh as TranslationResources
};

// 本地化Hook
export const useI18n = () => {
  // 获取本地存储的语言设置，如果没有则使用浏览器默认语言
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(resources).includes(savedLanguage)) {
      return savedLanguage;
    }

    const browserLanguage = navigator.language.split('-')[0] as Language;
    if (Object.keys(resources).includes(browserLanguage)) {
      return browserLanguage;
    }

    return 'zh'; // 默认使用中文
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<TranslationResources>(resources[language]);

  // 当语言改变时，更新翻译资源并保存到本地存储
  useEffect(() => {
    setTranslations(resources[language]);
    localStorage.setItem('language', language);
  }, [language]);

  // 切换语言
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  // 翻译函数，支持嵌套键和参数替换
  const t: TranslateFunction = (key, params = {}) => {
    // 分割键路径
    const keys = key.split('.');

    // 遍历键路径获取翻译
    let result: any = translations;
    for (const k of keys) {
      if (result[k] === undefined) {
        return key; // 如果键不存在，返回原始键
      }
      result = result[k];
    }

    // 如果结果是字符串，替换参数
    if (typeof result === 'string') {
      return Object.entries(params).reduce((acc, [param, value]) => {
        return acc.replace(new RegExp(`\\{${param}\\}`), value);
      }, result);
    }

    return result;
  };

  return {
    language,
    changeLanguage,
    t
  };
};

export default useI18n;