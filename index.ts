/// <reference path="./node_modules/babylonjs-gui/babylon.gui.d.ts"/>
import BABYLON from "babylonjs";
import "babylonjs-gui";
import "babylonjs-loaders";

enum GameKey {
    Back, // S on PC
    Forward, // right Oculus trigger, W on PC
    Left, // A on PC
    Right, // D on PC
}

const MAXIMUM_ROTATION = Math.PI / 6;
const PLAYER_SEAT_OFFSET = 1;
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
    player: BABYLON.AbstractMesh;

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
            this.importMesh("enemy", "models/", "enemy.babylon")
        ]);
        this.player = playerMeshes[0];
        // this.player.setPivotPoint(new BABYLON.Vector3(0, 0, 1));
        this.player.position = new BABYLON.Vector3(0, 1, 0);
        this.ground = BABYLON.MeshBuilder.CreateGround("ground", {
            width: 128,
            height: 128
        }, this.scene);
        this.hud.mesh = BABYLON.MeshBuilder.CreatePlane("hud", {
            size: 2
        }, this.scene);
        this.hud.mesh.rotate(BABYLON.Axis.Y, Math.PI / 4);
        this.hud.mesh.parent = this.player;
        this.hud.mesh.position.addInPlace(new BABYLON.Vector3(2.5, 1.25, 0.5));
        this.hud.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.hud.mesh);
        this.hud.velocity = new BABYLON.GUI.TextBlock("hud.velocity", "Velocity: 0");
        this.hud.velocity.color = "orange";
        this.hud.velocity.fontSize = "36px";
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
                this.velocity = Math.max(0, this.velocity + this.controllers[1].deviceRotationQuaternion.toEulerAngles().z / 100);
            }
            if (this.controllers.length > 0) {
                const [heightLeft, heightRight] = this.controllers.map(c => Math.trunc(c.devicePosition.y * ROTATION_PRECISION) / ROTATION_PRECISION);
                if (heightLeft !== heightRight) {
                    const amount = Math.abs(heightRight - heightLeft);
                    const directionComponent = heightRight > heightLeft ? 1 : -1;
                    this.player.rotation.y += amount * -directionComponent * ROTATION_SENSITIVITY;
                    this.player.rotation.x = amount * directionComponent;
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
        this.player.translate(BABYLON.Axis.X, this.velocity);
        this.player.position.y = oldY;
        // x2 = - ( r * D - x1 )
        this.vr.webVRCamera.position = this.player.position.add(new BABYLON.Vector3(
            Math.cos(-this.player.rotation.y) * -PLAYER_SEAT_OFFSET,
            2,
            Math.sin(-this.player.rotation.y) * -PLAYER_SEAT_OFFSET
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
        this.player.rotation.addInPlace(new BABYLON.Vector3(amount * directionComponent,
            amount * -directionComponent / 2,
            0
        ));
        this.fixRotation();
    }

    fixRotation() {
        // avoid tipping over
        this.player.rotation.x = Math.max(-MAXIMUM_ROTATION, Math.min(MAXIMUM_ROTATION, this.player.rotation.x));
    }

    importMesh(name: string, dir: string, filename: string): Promise<BABYLON.AbstractMesh[]> {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh(name, dir, filename, this.scene, meshes => {
                resolve(meshes);
            });
        });
    }
}

function toZero(value: number, threshold: number) {
    if (Math.abs(value) <= threshold) return value;
    return value + (threshold * (value > 0 ? -1 : 1));
}

$(document).ready(() => {
    const game = new Game();
    (<any>window).game = game;
    game.init().then(() => game.start())
        .catch(console.error);
});
