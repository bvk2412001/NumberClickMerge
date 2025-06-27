import { _decorator, Component, JsonAsset, Node, resources, sys } from 'cc';
import { BaseSingleton } from '../Base/BaseSingleton';
import { DataManager } from '../Manager/DataManager';
const { ccclass, property } = _decorator;

@ccclass('LanguageManager')
export class LanguageManager extends BaseSingleton<LanguageManager> {

    private _data: Record<string, string> = {};
    private _currentLang: string = 'en';

    private _supportedLangs = ['en', 'ru'];

    public async init() {
        // const savedLang = sys.localStorage.getItem('lang') || defaultLang;
        let savedLang = DataManager.getInstance().Language;
        if (savedLang != 'ru') {
            DataManager.getInstance().Language = 'en';
        }

        savedLang = DataManager.getInstance().Language;

        await this.loadLanguage(savedLang);
    }

    public async loadLanguage(lang: string): Promise<void> {
        this._currentLang = lang;
        return new Promise((resolve, reject) => {
            resources.load(`i18n/${lang}`, JsonAsset, (err, asset) => {
                if (err) {
                    console.error(`[i18n] Load failed: ${lang}`, err);
                    reject(err);
                    return;
                }
                this._data = asset.json;
                // sys.localStorage.setItem('lang', lang);
                DataManager.getInstance().Language = lang;
                resolve();
            });
        });
    }

    public t(key: string): string {
        return this._data[key] || key;
    }

    public get currentLang(): string {
        return this._currentLang;
    }

    public nextLanguage(): Promise<void> {
        const currentIndex = this._supportedLangs.indexOf(this._currentLang);
        const nextIndex = (currentIndex + 1) % this._supportedLangs.length;
        return this.loadLanguage(this._supportedLangs[nextIndex]);
    }
}


