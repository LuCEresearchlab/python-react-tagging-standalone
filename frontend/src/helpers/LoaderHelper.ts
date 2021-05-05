
export function JSONLoader(url: string, next: Function): void {
    fetch(url)
        .then(response => response.json())
        .then(json => {
            next(json)
        })
}
