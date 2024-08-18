import { LANGUAGES } from '../constants/constants';

const excludingMap = {
  en: ['en'],
  ua: ['ua', 'hi'],
  ru: ['ru', 'de', 'hi'],
  fr: ['fr', 'hi'],
  de: ['de', 'ru', 'hi'],
  es: ['es', 'hi'],
  hi: ['hi', 'ua', 'ru', 'fr', 'de', 'es'],
};

export const getPossibleLanguagePairs = (language: string) => {
  const excludingList = excludingMap[language];
  const possibleList = Object.entries(LANGUAGES).reduce(
    (result, [key, name]) => {
      if (excludingList.includes(key)) {
        return result;
      }
      return {
        ...result,
        [key]: name,
      };
    },
    {},
  );

  return possibleList;
};
