import { useEffect, useRef } from 'react';

/**
 * A custom React hook that allows the execution of a callback function at specified intervals using `setInterval`.
 * @param callback - the function to execute at the specified intervals
 * @param delay - the delay (in milliseconds) between each interval. If `null`, the interval is cleared and the function will not be executed.
 */
export function useInterval(callback: any, delay: any) {
    // Creating a ref 
    const savedCallback: any = useRef();
  
    // To remember the latest callback .
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
  
    // combining the setInterval and 
    //clearInterval methods based on delay.
    useEffect(() => {
        function func() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(func, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}