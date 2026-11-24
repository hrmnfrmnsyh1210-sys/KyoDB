export type Locale = 'id' | 'en'

export const useLocale = () => {
  const currentLocale = useState<Locale>('kyodb_locale', () => 'id')

  const setLocale = (locale: Locale) => {
    currentLocale.value = locale
    if (import.meta.client) {
      try {
        localStorage.setItem('kyodb_locale', locale)
      } catch {
        // silent
      }
    }
  }

  const toggleLocale = () => {
    setLocale(currentLocale.value === 'id' ? 'en' : 'id')
  }

  onMounted(() => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('kyodb_locale') as Locale | null
        if (saved === 'id' || saved === 'en') {
          currentLocale.value = saved
        }
      } catch {
        // silent
      }
    }
  })

  return {
    currentLocale,
    setLocale,
    toggleLocale,
    isId: computed(() => currentLocale.value === 'id'),
    isEn: computed(() => currentLocale.value === 'en')
  }
}
