export class Interval {
    private _timeInMilliSeconds: number;

    constructor(value: number) {
        this._timeInMilliSeconds = value;
}

    public get timeInMilliSeconds(): number {
        return this._timeInMilliSeconds;
    }
    public set timeInMilliSeconds(value: number) {
        this._timeInMilliSeconds = value;
    }
}