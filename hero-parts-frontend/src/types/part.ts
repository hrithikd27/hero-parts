export type AliasType = 'HINDI' | 'SLANG' | 'PHONETIC' | 'SYMPTOM' | 'COLOR' | 'MODEL_SLANG'

export interface PartAlias {
  id: number
  alias: string
  aliasType: AliasType
  language: string
}

export interface Part {
  id: number
  sku: string
  name: string
  hindiName: string | null
  description: string | null
  categoryId: number
  categoryName: string
  price: number
  mrp: number
  unit: string
  compatibleModels: string
  eshopUrl: string | null
  imageUrl: string | null
  inStock: boolean
  stockQty: number
  aliases: PartAlias[]
}

export interface Category {
  id: number
  name: string
  description: string | null
  parentId: number | null
  parentName: string | null
  subCategories: Category[]
  partCount: number
}
