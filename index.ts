import BABYLON from "babylonjs";

enum GameKey {
    Back, // S on PC
    Forward, // right Oculus trigger, W on PC
    Left, // A on PC
    Right, // D on PC
}

const MAXIMUM_ROTATION = Math.PI / 6;

class Game {
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    keysPressed: Set<GameKey> = new Set();
    scene: BABYLON.Scene;
    velocity: number;
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
            width: 0.5,
            height: 1,
            depth: 2
        }, this.scene);
        this.player.setPivotPoint(new BABYLON.Vector3(0, 0, 1));
        this.player.position = new BABYLON.Vector3(1, 1, 3);
        this.velocity = 0;
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
        if (this.keysPressed.has(GameKey.Forward)) {
            this.velocity = Math.max(0, this.velocity + (this.vr.isInVRMode
                ? this.controllers[1].deviceRotationQuaternion.z / 100
                : 0.005));
        }
        if (this.keysPressed.has(GameKey.Back)) this.velocity = Math.max(0, this.velocity - 0.0025);
        if (this.keysPressed.has(GameKey.Left)) this.rotate("left");
        if (this.keysPressed.has(GameKey.Right)) this.rotate("right");
        const oldY = this.player.position.y;
        this.player.translate(BABYLON.Axis.Z, this.velocity);
        this.player.position.y = oldY;
        this.velocity = toZero(this.velocity);
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

    rotate(direction: "left" | "right") {
        const directionComponent = direction === "left" ? 1 : -1;
        this.player.rotation.addInPlace(new BABYLON.Vector3(0,
            0.025 * -directionComponent / 2,
            0.025 * directionComponent
        ));
        this.player.rotation.z = Math.max(-MAXIMUM_ROTATION, Math.min(MAXIMUM_ROTATION, this.player.rotation.z));
    }
}

function toZero(value: number, threshold = 0.001) {
    if (Math.abs(value) <= threshold) return value;
    return value + (threshold * (value > 0 ? -1 : 1));
}

$(document).ready(() => {
    const game = new Game();
    (<any>window).game = game;
    game.start();
});
