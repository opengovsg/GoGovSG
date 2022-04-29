// declare this array as an immutable tuple const context, which allows us to get the narrow literal type directly
const assetVariants = ['gov', 'edu', 'health'] as const

// converts the assetVariants const context into a type
// "number" tells TS to interpret the array as a union of its values rather than the literal array type
type AssetVariants = typeof assetVariants[number]

const envVariant = process.env.ASSET_VARIANT
const foundVariant: AssetVariants | undefined = assetVariants.find(
  (variant) => variant === envVariant,
)

// ensure that foundVariant is defined
if (!foundVariant) throw Error('Invalid variant name!')

// exports a typed assetVariant variable for use in most files except webpack (used before ts compiles)

const assetVariant: AssetVariants = foundVariant
export default assetVariant
