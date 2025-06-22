import { Node, tween, UIOpacity, Vec3 } from 'cc';

export class AnimationService {
    static moveTo(node: Node, targetPos: Vec3, duration: number = 0.2): Promise<void> {
        return new Promise(resolve => {
            tween(node)
                .to(duration, { position: targetPos.clone() })
                .call(() => {
                    resolve
                })
                .start();
        });
    }

    static fadeOut(node: Node, duration: number = 0.2): Promise<void> {
        return new Promise(resolve => {
            const comp = node.getComponent(UIOpacity);
            if (!comp) return resolve();
            tween(comp)
                .to(duration, { opacity: 0 })
                .call(() => {
                    resolve
                })
                .start();
        });
    }


}