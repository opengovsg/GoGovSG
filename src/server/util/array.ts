const arraysContainSame = (a: any[] | undefined, b: any[] | undefined) => {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false
  }
  // @ts-ignore
  return a.length === b.length && a.every((el: any) => b.includes(el))
}

export default arraysContainSame
