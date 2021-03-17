import {useEffect, useState} from "react";

export function JSONLoader(url: string, next: Function): void {
    fetch(url)
        .then(response => response.json())
        .then(json => {
            next(json)
        })
}

// https://www.digitalocean.com/community/tutorials/creating-a-custom-usefetch-react-hook
export function useFetch<T>(url: string) {
    const [response, setResponse] = useState<T | undefined>(undefined);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(url);
                const json: T = await res.json();
                setResponse(json);
                setIsLoading(false)
            } catch (error) {
                setError(error);
            }
        };
        fetchData()
    }, []);
    return {response, error, isLoading};
};