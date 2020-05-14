// Circumvent issues with typescript not knowing about `this`
// variable during compile time. For use in setters in model
// definition.
export interface Settable {
    setDataValue(key: string, value: any): void
}

export interface IdType { readonly id: number }
