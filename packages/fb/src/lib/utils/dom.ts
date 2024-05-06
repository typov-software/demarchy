export function blurActive() {
  (document.activeElement as HTMLDivElement)?.blur();
}
