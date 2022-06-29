class Logger {
    on: boolean
    constructor(on: boolean) {
        this.on = on
    }
    public log(expr: () => string) {
        if (this.on) {
            let caller = (new Error()).stack?.split("\n")[2].trim().split(" ")[1]
            console.log(expr() + "   \t\t[" + caller + "]")
        }
    }


}

export const logger = new Logger(false)
