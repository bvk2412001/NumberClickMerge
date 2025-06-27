import { _decorator, Component, Node, sys } from 'cc';
import { BaseSingleton } from '../Base/BaseSingleton';
const { ccclass, property } = _decorator;

@ccclass('DataManager')
export class DataManager extends BaseSingleton<DataManager> {

    // #region FirstGame
    public get FirstGame(): boolean {
        const saved = localStorage.getItem("firstGame");
        return saved !== null && saved === 'false' ? false : true;
    }

    public set FirstGame(value: boolean) {
        localStorage.setItem("firstGame", value.toString());
    }

    // #region My Heart
    public get MyHeart(): number {
        const saved = localStorage.getItem("myHeart");
        return saved !== null ? parseInt(saved) : 5;
    }

    public set MyHeart(value: number) {
        if (value > 5) return;

        localStorage.setItem("myHeart", value.toString());
    }

    // #region NumberMax
    public get NumberMax(): number {
        const saved = localStorage.getItem("numberMax");
        return saved !== null ? parseInt(saved) : 8;
    }

    public set NumberMax(value: number) {
        localStorage.setItem("numberMax", value.toString());
    }

    // #region numberMin
    public get NumberMin(): number {
        const saved = localStorage.getItem("numberMin");
        return saved !== null ? parseInt(saved) : 1;
    }

    public set NumberMin(value: number) {
        localStorage.setItem("numberMin", value.toString());
    }

    // #region language
    public get Language(): string {
        const saved = localStorage.getItem("language");
        return saved ? saved : sys.language;
    }

    public set Language(value: string) {
        localStorage.setItem("language", value.toString());
    }

    // #region HighScore
    public get highScore(): number {
        const saved = localStorage.getItem("highScore");
        return saved ? parseInt(saved) : 0;
    }

    public set highScore(value: number) {
        localStorage.setItem("highScore", value.toString());
    }

    // #region CoreInPlayGame
    public get CoreInPlayGame(): number {
        const saved = localStorage.getItem("CoreInPlayGame");
        return saved ? parseInt(saved) : 0;
    }

    public set CoreInPlayGame(value: number) {
        localStorage.setItem("CoreInPlayGame", value.toString());
    }

    // #region DataMusic
    public get DataMusic(): boolean {
        const saved = localStorage.getItem("DataMusic");
        return saved !== null && saved === 'false' ? false : true;
    }

    public set DataMusic(value: boolean) {
        localStorage.setItem("DataMusic", value.toString());
    }

    // #region DataSound
    public get DataSound(): boolean {
        const saved = localStorage.getItem("DataSound");
        return saved !== null && saved === 'false' ? false : true;
    }

    public set DataSound(value: boolean) {
        localStorage.setItem("DataSound", value.toString());
    }

    // Lưu trạng thái game
    public saveGameState(gameState: any) {
        localStorage.setItem("gameState", JSON.stringify(gameState));
    }

    // Tải trạng thái game
    public loadGameState(): any {
        const saved = localStorage.getItem("gameState");
        return saved ? JSON.parse(saved) : null;
    }

    // Xóa trạng thái game
    public clearGameState() {
        localStorage.removeItem("gameState");
    }

    // #region Level
    public getLevel(): any {
        const saved = localStorage.getItem("DataLevel");
        return saved ? JSON.parse(saved) : null;
    }

    public setLevel(level: number, bar: number, exp: number): any {
        let obj = {
            level: level,
            bar: bar,
            exp: exp,
        };

        localStorage.setItem("DataLevel", JSON.stringify(obj));
    }
}


