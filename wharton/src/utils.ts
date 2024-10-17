export function choose(possibilities: string[]): string {
    return possibilities[Math.floor(possibilities.length * Math.random())];
}
