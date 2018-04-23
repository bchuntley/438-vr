import BABYLON from "babylonjs";

enum GameKey {
    Back, // S on PC
    Forward, // right Oculus trigger, W on PC
    Left, // A on PC
    Right, // D on PC
}

class Game {
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    keysPressed: Set<GameKey> = new Set();
    scene: BABYLON.Scene;
    vr: BABYLON.VRExperienceHelper;
    player: BABYLON.Mesh;

    get controllers(): BABYLON.OculusTouchController[] {
        return <any>this.vr.webVRCamera.controllers;
    }

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.onBeforeRenderObservable.add(this.beforeRender.bind(this));
        this.vr = this.scene.createDefaultVRExperience({
            controllerMeshes: false
        });
        this.vr.enableInteractions();
        this.vr.webVRCamera.onControllersAttachedObservable.add(controllers => {
            this.controllers[1].onTriggerStateChangedObservable.add(evt => {
                this.keysPressed[evt.pressed ? "add" : "delete"](GameKey.Forward);
            });
        });
        new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene);
        this.player = BABYLON.MeshBuilder.CreateBox("player", {
            width: 0.75,
            height: 0.5,
            depth: 2
        }, this.scene);
        this.player.position = new BABYLON.Vector3(1, 1, 3);
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
        const positionDiff = BABYLON.Vector3.Zero();
        if (this.keysPressed.has(GameKey.Forward)) {
            const velocity = this.vr.isInVRMode
                ? this.controllers[1].deviceRotationQuaternion.z / 10
                : 0.05;
            positionDiff.z += velocity;
        }
        if (this.keysPressed.has(GameKey.Back)) positionDiff.z -= 0.05;
        if (this.keysPressed.has(GameKey.Left)) this.player.rotation.z += 0.025;
        if (this.keysPressed.has(GameKey.Right)) this.player.rotation.z -= 0.025;
        this.player.position.addInPlace(positionDiff);
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
}

$(document).ready(() => {
    const game = new Game();
    (<any>window).game = game;
    game.start();
});
