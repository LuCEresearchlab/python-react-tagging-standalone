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
        // https://stackoverflow.com/questions/53949393/cant-perform-a-react-state-update-on-an-unmounted-component
        let isMounted = true; // note this flag denote mount status
        const fetchData = async () => {
            if(isMounted) setIsLoading(true);
            try {
                const res = await fetch(url);
                const json: T = await res.json();
                if(isMounted) {
                    setResponse(json);
                    setIsLoading(false)
                }
            } catch (error) {
                if(isMounted) {
                    setError(error);
                }
            }
        };
        fetchData()
        return () => { isMounted = false }; // use effect cleanup to set flag false, if unmounted
    }, []);
    return {response, error, isLoading};
};