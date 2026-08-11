import {
  Hammer,
  Wrench,
  Zap,
  Sparkles,
  Truck,
  Flower2,
  Car,
  ChefHat,
  Scissors,
  Paintbrush,
  Flame,
  Hand,
} from 'lucide-react'

const ICONS = {
  hammer: Hammer,
  wrench: Wrench,
  zap: Zap,
  sparkles: Sparkles,
  truck: Truck,
  flower: Flower2,
  car: Car,
  chef: ChefHat,
  scissors: Scissors,
  paint: Paintbrush,
  flame: Flame,
  tools: Hand,
}

export function CategoryIcon({ name, className }) {
  const Icon = ICONS[name] || Wrench
  return <Icon className={className} />
}

export const getCategoryName = (category, lang) => {
  if (!category) return ''
  return category[`name_${lang}`] || category.name_uz || category.name_en || ''
}
