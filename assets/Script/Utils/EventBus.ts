type Listener = (payload: any) => void;

export class EventBus {
    private static events: { [key: string]: Listener[] } = {};

    // Đăng ký sự kiện với context
    public static on(event: string, callback: Listener, context?: any): () => void {
        // Bind callback với context nếu context được cung cấp
        const boundCallback = context ? callback.bind(context) : callback;

        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(boundCallback);

        // Trả về hàm hủy đăng ký
        return () => {
            this.off(event, boundCallback);
        };
    }

    // Phát sự kiện
    public static emit(event: string, payload?: any): void {
        if (this.events[event]) {
            this.events[event].forEach((callback) => callback(payload));
        }
    }

    // Hủy đăng ký sự kiện
    public static off(event: string, callback: Listener): void {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
            if (this.events[event].length === 0) {
                delete this.events[event];
            }
        }
    }

    // Xóa tất cả sự kiện
    public static clear(): void {
        this.events = {};
    }
}