
function devCmd(
    method: (message?: any, ...optionalParams: any[]) => void
): (message?: any, ...optionalParams: any[]) => void {
    return (message?: any, ...optionalParams: any[]): void => {
        if (__DEV__) {
            method(message, ...optionalParams);
        }
    }
}

export const error = devCmd(console.error);
export const info = devCmd(console.info);
export const log = devCmd(console.log);
export const warn = devCmd(console.warn);
export const trace = devCmd(console.trace);
export const debug = devCmd(console.debug);