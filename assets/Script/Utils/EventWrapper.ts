export class Action {
    public callback: CallableFunction = null
    public key: string


    constructor(key: string, callback: CallableFunction) {
        this.key = key
        this.callback = callback
    }
}

export class EventWrapper<T = void> {
    private listeners: Array<Action> = [];

    public addListener(action: Action): void {
        this.listeners.push(action);
    }

    public removeListener(action: Action): void {
        let index = this.listeners.findIndex(e => e.key == action.key)
        if (index != -1) {
            this.listeners.splice(index, 1)
        }
    }

    public invoke(): void {
        for (const listener of this.listeners) {
            listener.callback()
        }
    }

    public clear(): void {
        this.listeners = [];
    }
}
