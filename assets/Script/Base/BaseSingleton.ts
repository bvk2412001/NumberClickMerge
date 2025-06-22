import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseSingleton')
export class BaseSingleton<T> extends Component {
    private static _instances: Map<Function, Component> = new Map();

    public static getInstance<T extends Component>(this: new () => T): T {
        let instance = BaseSingleton._instances.get(this) as T;

        if (!instance) {
            // Try to find an existing instance in the scene
            const nodes = director.getScene()?.getComponentsInChildren(this);
            if (nodes && nodes.length > 0) {
                instance = nodes[0] as T;
                if (nodes.length > 1) {
                    console.error(`[Singleton] More than one instance of ${this.name} found!`);
                }
            } else {
                // Create a new node if none is found
                const node = new Node(`(singleton) ${this.name}`);
                instance = node.addComponent(this);
                director.getScene()?.addChild(node); // Optional: add to scene
            }

            BaseSingleton._instances.set(this, instance);
        }

        return instance;
    }

    protected onLoad() {
        const type = this.constructor as Function;

        if (!BaseSingleton._instances.has(type)) {
            BaseSingleton._instances.set(type, this);
        } else if (BaseSingleton._instances.get(type) !== this) {
            this.node.destroy();
        }
    }

    protected onDestroy() {
        const type = this.constructor as Function;
        if (BaseSingleton._instances.get(type) === this) {
            BaseSingleton._instances.delete(type);
        }
    }
}


