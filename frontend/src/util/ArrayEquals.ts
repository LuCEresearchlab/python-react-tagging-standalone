import stringEquals from "./StringEquals";

export function arrayEquals(arr1: any[], arr2: any[]): boolean {
    if (arr1 == null) return arr2 == null
    if (arr2 == null) return false
    return stringEquals(JSON.stringify(arr1), JSON.stringify(arr2))
}

export function arrayFilteredNotNullEquals(arr1: any[], arr2: any[]): boolean {
    return arrayEquals(
        arr1.filter(elem => elem != null),
        arr2.filter(elem => elem != null)
    )
}