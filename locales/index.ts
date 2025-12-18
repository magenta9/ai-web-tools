export { zhCN, type Locale } from './zh-CN'
export { enUS } from './en-US'

export type LocaleKey = 'zh-CN' | 'en-US'

export const locales = {
    'zh-CN': () => import('./zh-CN').then((m) => m.zhCN),
    'en-US': () => import('./en-US').then((m) => m.enUS),
}

export const defaultLocale: LocaleKey = 'zh-CN'
