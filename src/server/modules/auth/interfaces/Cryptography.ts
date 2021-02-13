export interface Cryptography {
  hash(data: string, saltOrRounds: string | number): Promise<string>

  compare(data: string, encrypted: string): Promise<boolean>
}
