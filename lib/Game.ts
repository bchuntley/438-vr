/// <reference path="../node_modules/babylonjs-gui/babylon.gui.d.ts"/>
import Constants from "./Constants";
import Enemy from "./Enemy";
import GameKey from "./GameKey";
import Player from "./Player";
import Utils from "./Utils";
import BABYLON from "babylonjs";
import "babylonjs-gui";
import "babylonjs-loaders";

export default class Game {
    canvas: HTMLCanvasElement;
    enemy: Enemy;
    engine: BABYLON.Engine;
    ground: BABYLON.AbstractMesh;
    bounds: BABYLON.AbstractMesh;
    keysPressed: Set<GameKey> = new Set();
    scene: BABYLON.Scene;
    vr: BABYLON.VRExperienceHelper;
    player: Player;
    active = false;
    hasStarted = false;
    guiText: BABYLON.GUI.TextBlock;

    get controllers(): BABYLON.OculusTouchController[] {
        return <any>this.vr.webVRCamera.controllers;
    }

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.engine.enableOfflineSupport = false; // necessary for localhost model loading
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(this));
        this.vr = this.scene.createDefaultVRExperience({
            controllerMeshes: true
        });
        this.vr.enableInteractions();
        // handle trigger press
        this.vr.webVRCamera.onControllersAttachedObservable.add(controllers => {
            this.controllers[1].onTriggerStateChangedObservable.add(evt => {
                this.keysPressed[evt.pressed ? "add" : "delete"](GameKey.Forward);
                if (!this.hasStarted) {
                    this.hasStarted = true;
                    this.play();
                }
            });
        });
        // start / end text
        this.guiText = new BABYLON.GUI.TextBlock();
        this.guiText.text = "Press the trigger to begin.";
        this.guiText.color = "white";
        this.guiText.fontSize = "128px";
    }

    async init() {
        new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene);
        // load all models and meshes
        const [playerMeshes, enemyMeshes, groundMeshes, wallMeshes] = await Promise.all([
            this.importMesh("Cube", "models/", "player.babylon"),
            this.importMesh("Enemy", "models/", "enemy.babylon"),
            this.importMesh("FloorMap", "models/", "floor.babylon"),
            this.importMesh("BoundingWalls", "models/", "floor.babylon")
        ]);
        this.player = new Player(this, playerMeshes[0]);
        this.player.mesh.position = new BABYLON.Vector3(-32, 1, -32);
        this.enemy = new Enemy(this, enemyMeshes[0]);
        this.enemy.mesh.position = new BABYLON.Vector3(32, 1, 32);
        this.ground = groundMeshes[0];
        this.bounds = wallMeshes[0];
    }

    start() {
        this.engine.runRenderLoop(() => this.scene.render());
        $(window).on("keydown keyup", evt => { // handle PC key events (WASD)
            const gameKey = this.convertKey(evt.which);
            if (gameKey === undefined) return;
            this.keysPressed[evt.type === "keydown" ? "add" : "delete"](gameKey);
            if (!this.active) this.play();
        }).on("resize", () => this.engine.resize());
    }

    beforeRender() { // called every tick
        if (!this.active) return;
        if (!this.enemy.alive || !this.player.alive) return this.stop();
        this.player.update();
        this.enemy.update();
    }

    /** converts from JQuery key to GameKey */
    convertKey(key: JQuery.Key): GameKey | undefined {
        switch (key) {
            case JQuery.Key.W: return GameKey.Forward;
            case JQuery.Key.S: return GameKey.Back;
            case JQuery.Key.A: return GameKey.Left;
            case JQuery.Key.D: return GameKey.Right;
            default: return undefined;
        }
    }

    /** promisification of SceneLoader.ImportMesh */
    importMesh(name: string, dir: string, filename: string): Promise<BABYLON.AbstractMesh[]> {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh(name, dir, filename, this.scene, meshes => {
                resolve(meshes);
            });
        });
    }

    play() {
        this.player.hud.texture!.removeControl(this.guiText);
        this.active = true;
    }

    stop() {
        this.guiText.text = "Game Over";
        this.player.hud.texture!.addControl(this.guiText);
        this.active = false;
    }
}
