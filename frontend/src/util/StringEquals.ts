function stringEquals(str1: (null | string), str2: (null | string)): boolean {
    if (str1 == null) return str2 == null
    if (str2 == null) return false
    return str1.localeCompare(str2) === 0
}

export default stringEquals