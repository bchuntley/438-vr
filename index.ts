import BABYLON from "babylonjs";

class Game {
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    vr: BABYLON.VRExperienceHelper;
    player: BABYLON.Mesh;

    get controllers(): BABYLON.OculusTouchController[] {
        return <any>this.vr.webVRCamera.controllers;
    }

    isRightTriggerPressed = false;

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
            console.log(controllers);
            this.controllers[1].onTriggerStateChangedObservable.add(evt => {
                this.isRightTriggerPressed = evt.pressed;
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
        window.addEventListener("resize", () => this.engine.resize());
    }

    beforeRender() {
        if (this.controllers.length === 0) return;
        // left is negative z, right is positive z
        if (this.isRightTriggerPressed) {
            this.player.position.addInPlace(new BABYLON.Vector3(0, 0, this.controllers[1].deviceRotationQuaternion.z / 10));
        }
    }
}

$(document).ready(() => {
    const game = new Game();
    (<any>window).game = game;
    game.start();
});
