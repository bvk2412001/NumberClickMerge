import { _decorator, Component, find, log, Node, tween, UIOpacity, Vec3 } from 'cc';
import { AutoComponent } from '../Base/AutoComponent';
const { ccclass, property } = _decorator;

@ccclass('FXShadow')
export class FXShadow extends AutoComponent {

    @property({ type: UIOpacity })
    shadow: UIOpacity = null;

    LoadShadow() {
        if (this.shadow != null) return;
        this.shadow = find('Canvas/IngameUIManager/Shadow').getComponent(UIOpacity);
    }

    protected LoadComponent(): void {
        this.LoadShadow();
    }

    ShowFxShadow(): Promise<void> {
        return new Promise((resolve) => {
            this.shadow.node.active = true;
            this.shadow.opacity = 155;
            tween(this.shadow)
                .to(0.3, { opacity: 255 }, { easing: 'quadInOut' })
                .call(() => {
                    resolve();
                })
                .start();
        })
    }

    HideFXShadow(): Promise<void> {
        return new Promise((resolve) => {
            tween(this.shadow)
                .to(0.3, { opacity: 0 }, { easing: 'quadInOut' })
                .call(() => {
                    this.shadow.node.active = false;
                    resolve();
                })
                .start();
        })
    }

    ShowFxGuide(guide: Node): Promise<void> {
        return new Promise((resolve) => {
            guide.children.forEach((element) => {
                element.active = false;

                log(element, element.name)
            })

            guide.active = true;
            const posLocal = guide.getPosition().clone();
            guide.setPosition(-1080, posLocal.y, posLocal.z);
            tween(guide)
                .to(0.3, { position: new Vec3(0, posLocal.y, posLocal.z) })
                .call(() => {
                    resolve();
                })
                .start();
        })
    }

    HideFxGuide(guide: Node): Promise<void> {
        return new Promise((resolve) => {
            const posLocal = guide.getPosition().clone();
            tween(guide)
                .to(0.3, { position: new Vec3(-1080, posLocal.y, posLocal.z) })
                .call(() => {
                    guide.active = false;
                    resolve();
                })
                .start();
        })
    }
}


