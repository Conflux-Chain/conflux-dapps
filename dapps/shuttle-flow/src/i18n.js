import i18next from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './assets/locales/en.json'
import zh from './assets/locales/zh-CN.json'

const resources = {
  en: {translation: en},
  zh: {translation: zh},
}

if (window.__POWERED_BY_QIANKUN__) {
  i18next
  .use(initReactI18next)
  .init({
    resources,
    // TODO: remove when publish
    lng: 'en',
    debug: true,
    fallbackLng: 'en',
    interpolation: {escapeValue: false},
  })
} else {
  i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // TODO: remove when publish
    debug: true,
    fallbackLng: 'en',
    interpolation: {escapeValue: false},
  })
}

export default i18next
