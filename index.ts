/// <reference path="./node_modules/babylonjs-gui/babylon.gui.d.ts"/>
import BABYLON from "babylonjs";
import "babylonjs-gui";

enum GameKey {
    Back, // S on PC
    Forward, // right Oculus trigger, W on PC
    Left, // A on PC
    Right, // D on PC
}

const MAXIMUM_ROTATION = Math.PI / 6;
const ROTATION_PRECISION = 25;
const ROTATION_SENSITIVITY = 0.1;

class Game {
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    ground: BABYLON.Mesh;
    hud: {
        texture?: BABYLON.GUI.AdvancedDynamicTexture;
        mesh?: BABYLON.Mesh;
        velocity?: BABYLON.GUI.TextBlock;
    } = {};
    keysPressed: Set<GameKey> = new Set();
    scene: BABYLON.Scene;
    velocity = 0;
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
            controllerMeshes: true
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
            depth: 2,
            faceColors: [0, 0, 0, 0, 0, 0].map(() => new BABYLON.Color4(0, 1, 0, 1))
        }, this.scene);
        this.player.setPivotPoint(new BABYLON.Vector3(0, 0, 1));
        this.player.position = new BABYLON.Vector3(1, 1, 3);
        this.ground = BABYLON.MeshBuilder.CreateGround("ground", {
            width: 16,
            height: 16
        }, this.scene);
        this.hud.mesh = BABYLON.MeshBuilder.CreatePlane("hud", {
            size: 2
        }, this.scene);
        this.hud.mesh.parent = this.player;
        this.hud.mesh.position.addInPlace(new BABYLON.Vector3(0, 1, 1));
        this.hud.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.hud.mesh);
        this.hud.velocity = new BABYLON.GUI.TextBlock("hud.velocity", "Velocity: 0");
        this.hud.velocity.color = "white";
        this.hud.texture.addControl(this.hud.velocity);
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
        if (this.vr.isInVRMode) {
            if (this.keysPressed.has(GameKey.Forward)) {
                this.velocity = Math.max(0, this.velocity + this.controllers[1].deviceRotationQuaternion.z / 100);
            }
            if (this.controllers.length > 0) {
                const [heightLeft, heightRight] = this.controllers.map(c => Math.trunc(c.devicePosition.y * ROTATION_PRECISION) / ROTATION_PRECISION);
                if (heightLeft !== heightRight) {
                    const amount = Math.abs(heightRight - heightLeft);
                    const directionComponent = heightRight > heightLeft ? 1 : -1;
                    this.player.rotation.y += amount * -directionComponent * ROTATION_SENSITIVITY;
                    this.player.rotation.z = amount * directionComponent;
                    this.fixRotation();
                }
            }
        } else { // normal PC controls
            if (this.keysPressed.has(GameKey.Forward)) this.velocity += 0.005;
            if (this.keysPressed.has(GameKey.Back)) this.velocity = Math.max(0, this.velocity - 0.005);
            if (this.keysPressed.has(GameKey.Left)) this.rotate("left", 0.025);
            if (this.keysPressed.has(GameKey.Right)) this.rotate("right", 0.025);
        }
        const oldY = this.player.position.y;
        this.player.translate(BABYLON.Axis.Z, this.velocity);
        this.player.position.y = oldY;
        this.vr.webVRCamera.position = this.player.position.clone().add(new BABYLON.Vector3(
            -1 * Math.sin(this.player.rotation.y),
            1,
            -1 * Math.cos(this.player.rotation.y)
        ));
        // decelerate due to friction
        this.velocity = toZero(this.velocity, 0.001);
        this.hud.velocity!.text = `Velocity: ${this.velocity.toFixed(2)}`;
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

    rotate(direction: "left" | "right", amount: number) {
        const directionComponent = direction === "left" ? 1 : -1;
        this.player.rotation.addInPlace(new BABYLON.Vector3(0,
            amount * -directionComponent / 2,
            amount * directionComponent
        ));
        this.fixRotation();
    }

    fixRotation() {
        // avoid tipping over
        this.player.rotation.z = Math.max(-MAXIMUM_ROTATION, Math.min(MAXIMUM_ROTATION, this.player.rotation.z));
    }
}

function toZero(value: number, threshold: number) {
    if (Math.abs(value) <= threshold) return value;
    return value + (threshold * (value > 0 ? -1 : 1));
}

$(document).ready(() => {
    const game = new Game();
    (<any>window).game = game;
    game.start();
});
