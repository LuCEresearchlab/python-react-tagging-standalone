import {useEffect, useRef, useState} from "react";

export function JSONLoader(url: string, next: Function): void {
    fetch(url)
        .then(response => response.json())
        .then(json => {
            next(json)
        })
}

export function useFetch(url: string): { data: any, isLoading: boolean } {
    const [state, setState] = useState<any>({data: null, isLoading: true});
    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        setState({...state, data: state.data, loading: true})
        fetch(url)
            .then(response => response.json())
            .then(json => {
                if (isMounted.current) setState({...state, data: json, loading: false})
            })
    }, [url, setState]);
    return state;
}