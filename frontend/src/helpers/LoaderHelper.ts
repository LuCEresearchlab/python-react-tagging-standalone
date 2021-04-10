import {useEffect, useRef, useState} from "react";

export function JSONLoader(url: string, next: Function): void {
    fetch(url)
        .then(response => response.json())
        .then(json => {
            next(json)
        })
}

interface useFetchInterface<T> {
    data: T,
    isLoading: boolean
}

export function useFetch<T>(url: string): useFetchInterface<T> {
    const [state, setState] = useState<{ data: any, isLoading: boolean }>({data: null, isLoading: true});
    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then(json => {
                if (isMounted.current) {
                    console.log({...state, data: json, isLoading: false})
                    setState({...state, data: json, isLoading: false})
                }
            })
    }, [url, setState]);
    return state;
}