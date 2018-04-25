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
    engine: BABYLON.Engine;
    ground: BABYLON.Mesh;
    keysPressed: Set<GameKey> = new Set();
    scene: BABYLON.Scene;
    vr: BABYLON.VRExperienceHelper;
    player: Player;

    get controllers(): BABYLON.OculusTouchController[] {
        return <any>this.vr.webVRCamera.controllers;
    }

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.engine.enableOfflineSupport = false;
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(this));
        this.vr = this.scene.createDefaultVRExperience({
            controllerMeshes: true
        });
        this.vr.enableInteractions();
        this.vr.webVRCamera.onControllersAttachedObservable.add(controllers => {
            this.controllers[1].onTriggerStateChangedObservable.add(evt => {
                this.keysPressed[evt.pressed ? "add" : "delete"](GameKey.Forward);
            });
        });
    }

    async init() {
        new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene);
        const [playerMeshes, enemyMeshes] = await Promise.all([
            this.importMesh("Cube", "models/", "player.babylon"),
            this.importMesh("Enemy", "models/", "enemy.babylon")
        ]);
        this.player = new Player(this, playerMeshes[0]);
        this.player.mesh.position = new BABYLON.Vector3(0, 1, 0);
        Enemy.baseMesh = enemyMeshes[0];
        Enemy.baseMesh.isVisible = false;
        this.ground = BABYLON.MeshBuilder.CreateGround("ground", {
            width: 128,
            height: 128
        }, this.scene);
    }

    start() {
        this.engine.runRenderLoop(() => this.scene.render());
        $(window).on("keydown keyup", evt => {
            const gameKey = this.convertKey(evt.which);
            if (gameKey === undefined) return;
            this.keysPressed[evt.type === "keydown" ? "add" : "delete"](gameKey);
        }).on("resize", () => this.engine.resize());
    }

    beforeRender() {
        this.player.update();
    }

    convertKey(key: JQuery.Key): GameKey | undefined {
        switch (key) {
            case JQuery.Key.W: return GameKey.Forward;
            case JQuery.Key.S: return GameKey.Back;
            case JQuery.Key.A: return GameKey.Left;
            case JQuery.Key.D: return GameKey.Right;
            default: return undefined;
        }
    }

    importMesh(name: string, dir: string, filename: string): Promise<BABYLON.AbstractMesh[]> {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh(name, dir, filename, this.scene, meshes => {
                resolve(meshes);
            });
        });
    }
}
