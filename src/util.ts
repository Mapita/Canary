// Helpers to set text colors
export const red = (text: any) => '\u001b[91m' + text + '\u001b[39m';
export const green = (text: any) => '\u001b[92m' + text + '\u001b[39m';
export const yellow = (text: any) => '\u001b[93m' + text + '\u001b[39m';

// Helper function to retrieve the current time in milliseconds.
export function getTime(): number {
    if(typeof performance === "undefined"){
        return new Date().getTime();
    }else{
        return performance.now();
    }
}

// Helper function to get an ordinal string like "1st", "2nd", "3rd"...
// Expects the input to be an integer.
// This is used to produce helpful names for tests and callbacks that
// weren't assigned more descriptive names by their developer.
export function getOrdinal(value: number): string {
    const lastDigit = value % 10;
    if(lastDigit === 1){
        return `${value}st`;
    }else if(lastDigit === 2){
        return `${value}nd`;
    }else if(lastDigit === 3){
        return `${value}rd`;
    }else{
        return `${value}th`;
    }
}

// Helper function to get the path to the file where a test was defined.
export function getCallerLocation(): string {
    const error = new Error();
    if(error.stack){
        const lines = error.stack.split("\n");
        for(let i = 2; i < lines.length; i++){
            if(i > 0 && lines[i] === "    at <anonymous>"){
                const paren = lines[i - 1].indexOf("(");
                if(paren >= 0){
                    return lines[i - 1].slice(paren + 1, lines[i - 1].length - 1);
                }else{
                    return "";
                }
            }else if(
                !lines[i].startsWith("    at CanaryTest.") &&
                !lines[i].startsWith("    at new CanaryTest")
            ){
                const paren = lines[i].indexOf("(");
                if(paren >= 0){
                    return lines[i].slice(paren + 1, lines[i].length - 1);
                }else{
                    return lines[i].slice(7, lines[i].length);
                }
            }
        }
    }
    return "";
}

// Helper function to normalize a file path for comparison.
// Makes all slashes forward slashes, removes trailing and redundant
// slashes, and resolves "." and "..".
export function normalizePath(path: string): string {
    // Separate the path into parts (delimited by slashes)
    let parts = [""];
    for(let char of path){
        if(char === "/" || char === "\\"){
            if(parts[parts.length - 1].length){
                parts.push("");
            }
        }else{
            parts[parts.length - 1] += char;
        }
    }
    // Special case for when the entire path was "."
    if(parts.length === 1 && parts[0] === "."){
        return ".";
    }
    // Resolve "." and ".."
    let i = 0;
    while(i < parts.length){
        if(parts[i] === "."){
            parts.splice(i, 1);
        }else if(i > 0 && parts[i] === ".."){
            parts.splice(i - 1, 2);
            i--;
        }else{
            i++;
        }
    }
    // Build the resulting path
    let result = "";
    for(let part of parts){
        if(part && part.length){
            if(result.length){
                result += "/";
            }
            result += part;
        }
    }
    // Retain a slash at the beginning of the string
    if(path[0] === "/" || path[0] === "\\"){
        result = "/" + result;
    }
    // All done!
    return result;
}

// True when the input is a finite number.
export function isFiniteNumber(value: any): boolean {
    return typeof(value) === "number" && Number.isFinite(<number> value);
}
