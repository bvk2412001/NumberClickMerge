export type Listener<T> = (payload: T) => void;

export class EventBus {
    private static events: Map<string, Listener<any>[]> = new Map();

    public static on<T>(event: string, callback: Listener<T>) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }

    public static emit<T>(event: string, payload: T) {
        if (!this.events.has(event)) return;
        this.events.get(event)!.forEach(callback => callback(payload));
    }

    public static off<T>(event: string, callback: Listener<T>) {
        if (!this.events.has(event)) return;
        const listeners = this.events.get(event)!;
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    public static clear(event: string) {
        this.events.delete(event);
    }

    public static clearAll() {
        this.events.clear();
    }
}
