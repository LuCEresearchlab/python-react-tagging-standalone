export function JSONLoader(url:string, next:Function){
    fetch(url)
        .then(response => response.json())
        .then(json => {
            next(json)
        })
}