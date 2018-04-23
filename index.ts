import BABYLON from "babylonjs";

class Game {
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    vr: BABYLON.VRExperienceHelper;
    get controllers() {
        return this.vr.webVRCamera.controllers;
    }

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.vr = this.scene.createDefaultVRExperience({
            controllerMeshes: false
        });
        new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene);
        const box = BABYLON.MeshBuilder.CreateBox("player", { size: 2 }, this.scene);
    }

    start() {
        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }
}

$(document).ready(() => {
    const game = new Game();
    (<any>window).game = game;
    game.start();
});
