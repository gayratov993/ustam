export function formatPrice(value, priceType) {
  if (value == null) return ''
  const num = Number(value)
  const formatted = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(num)
  if (priceType === 'per_day') return `${formatted} so'm/kun`
  return `${formatted} so'm`
}

export function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hozir'
  if (mins < 60) return `${mins} daq.`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} kun`
  return formatDate(date)
}

export function pluralizeUz(count, one, _few, _many) {
  if (count === 1) return one
  return _few
}
