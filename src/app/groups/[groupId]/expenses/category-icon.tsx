import { Category } from '@prisma/client'
import {
  Apple,
  Armchair,
  Baby,
  Banknote,
  Bike,
  Bus,
  Car,
  CarTaxiFront,
  Cat,
  Clapperboard,
  Cog,
  Dices,
  Dribbble,
  Droplets,
  FerrisWheel,
  Fuel,
  Gift,
  HandPlatter,
  Home,
  Hotel,
  Landmark,
  LibraryBig,
  Lightbulb,
  LucideIcon,
  LucideProps,
  Music,
  ParkingSquare,
  Percent,
  Plane,
  Plug,
  Shirt,
  ShoppingCart,
  Sparkles,
  SprayCan,
  Stethoscope,
  ThermometerSun,
  Train,
  Trash,
  Utensils,
  Wifi,
  Wine,
  Wrench,
} from 'lucide-react'

export function CategoryIcon({
  category,
  ...props
}: { category: Category | null } & LucideProps) {
  const Icon = getCategoryIcon(`${category?.grouping}/${category?.name}`)
  return <Icon {...props} />
}

function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case 'Uncategorized/General':
      return Banknote
    case 'Uncategorized/Payment':
      return Banknote
    case 'Entertainment/Entertainment':
      return FerrisWheel
    case 'Entertainment/Games':
      return Dices
    case 'Entertainment/Movies':
      return Clapperboard
    case 'Entertainment/Music':
      return Music
    case 'Entertainment/Sports':
      return Dribbble
    case 'Food and Drink/Food and Drink':
      return Apple
    case 'Food and Drink/Dining Out':
      return Utensils
    case 'Food and Drink/Groceries':
      return ShoppingCart
    case 'Food and Drink/Liquor':
      return Wine
    case 'Home/Home':
      return Home
    case 'Home/Electronics':
      return Plug
    case 'Home/Furniture':
      return Armchair
    case 'Home/Household Supplies':
      return SprayCan
    case 'Home/Maintenance':
      return Wrench
    case 'Home/Mortgage':
      return Landmark
    case 'Home/Pets':
      return Cat
    case 'Home/Rent':
      return Home
    case 'Home/Services':
      return HandPlatter
    case 'Life/Childcare':
      return Baby
    case 'Life/Clothing':
      return Shirt
    case 'Life/Education':
      return LibraryBig
    case 'Life/Gifts':
      return Gift
    case 'Life/Insurance':
      return Landmark
    case 'Life/Medical Expenses':
      return Stethoscope
    case 'Life/Taxes':
      return Percent
    case 'Transportation/Transportation':
      return Bus
    case 'Transportation/Bicycle':
      return Bike
    case 'Transportation/Bus/Train':
      return Train
    case 'Transportation/Car':
      return Car
    case 'Transportation/Gas/Fuel':
      return Fuel
    case 'Transportation/Hotel':
      return Hotel
    case 'Transportation/Parking':
      return ParkingSquare
    case 'Transportation/Plane':
      return Plane
    case 'Transportation/Taxi':
      return CarTaxiFront
    case 'Utilities/Utilities':
      return Cog
    case 'Utilities/Cleaning':
      return Sparkles
    case 'Utilities/Electricity':
      return Lightbulb
    case 'Utilities/Heat/Gas':
      return ThermometerSun
    case 'Utilities/Trash':
      return Trash
    case 'Utilities/TV/Phone/Internet':
      return Wifi
    case 'Utilities/Water':
      return Droplets
    default:
      return Banknote
  }
}
