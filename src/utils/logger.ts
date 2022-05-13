class Logger {
    on: boolean
    constructor(on: boolean) {
        this.on = on
    }
    public log(expr: () => string) {
        if (this.on) {
            console.log(expr())
        }
    }
}

export const logger = new Logger(false)
