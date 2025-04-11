export class ScanVfSearchException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ScanVfSearchException";
    }
}