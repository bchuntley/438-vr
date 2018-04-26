import Bike from "./Bike";
import Constants from "./Constants";
import GameKey from "./GameKey";
import Game from "./Game";

export default class Player extends Bike {
    hud: {
        texture?: BABYLON.GUI.AdvancedDynamicTexture;
        mesh?: BABYLON.Mesh;
        velocity?: BABYLON.GUI.TextBlock;
    } = {};
    get trailColor() { return BABYLON.Color3.Blue(); }

    constructor(game: Game, mesh: BABYLON.AbstractMesh) {
        super(game, mesh);
        this.hud.mesh = BABYLON.MeshBuilder.CreatePlane("hud", {
            size: 2
        }, this.game.scene);
        this.hud.mesh.rotate(BABYLON.Axis.Y, Math.PI / 4);
        this.hud.mesh.parent = this.mesh;
        this.hud.mesh.position.addInPlace(new BABYLON.Vector3(2.5, 1.25, 0.5));
        this.hud.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.hud.mesh);
        this.hud.velocity = new BABYLON.GUI.TextBlock("hud.velocity", "Velocity: 0");
        this.hud.velocity.color = "orange";
        this.hud.velocity.fontSize = "36px";
        this.hud.texture.addControl(this.hud.velocity);
    }

    update() {
        if (this.game.vr.isInVRMode) {
            if (this.game.keysPressed.has(GameKey.Forward)) {
                this.accelerate(this.game.controllers[1].deviceRotationQuaternion.toEulerAngles().z * Constants.ACCELERATION);
            }
            if (this.game.controllers.length > 0) {
                const [heightLeft, heightRight] = this.game.controllers.map(c => Math.trunc(c.devicePosition.y * Constants.ROTATION_PRECISION) / Constants.ROTATION_PRECISION);
                if (heightLeft !== heightRight) {
                    const amount = Math.abs(heightRight - heightLeft);
                    const directionComponent = heightRight > heightLeft ? 1 : -1;
                    this.mesh.rotation.y += amount * -directionComponent * Constants.ROTATION_SENSITIVITY;
                    this.mesh.rotation.x = amount * directionComponent;
                    this.fixRotation();
                }
            }
        } else { // normal PC controls
            if (this.game.keysPressed.has(GameKey.Forward)) this.accelerate(Constants.ACCELERATION);
            if (this.game.keysPressed.has(GameKey.Back)) this.accelerate(-Constants.ACCELERATION);
            if (this.game.keysPressed.has(GameKey.Left)) this.rotate("left", 0.05);
            if (this.game.keysPressed.has(GameKey.Right)) this.rotate("right", 0.05);
        }
        super.update();
        this.game.vr.webVRCamera.position = this.mesh.position.add(new BABYLON.Vector3(
            Math.cos(-this.mesh.rotation.y) * -Constants.PLAYER_SEAT_OFFSET,
            2,
            Math.sin(-this.mesh.rotation.y) * -Constants.PLAYER_SEAT_OFFSET
        ));
        this.hud.velocity!.text = `Velocity: ${this.velocity.toFixed(2)} m/s`;
    }
}
