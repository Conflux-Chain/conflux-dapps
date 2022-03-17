import useDarkMode from 'use-dark-mode'

export default function useTheme() {
  let initTheme = 'light'
  if (
    localStorage.darkMode === 'dark' ||
    (!('darkMode' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    initTheme = 'dark'
  }

  const darkMode = useDarkMode(initTheme, {
    classNameDark: 'dark',
    classNameLight: 'light',
    storageKey: 'darkMode',
  })
  return darkMode
}
