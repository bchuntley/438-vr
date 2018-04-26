# TRON-VR

- TRON-VR is a web-based VR implementation of the lightcycles from TRON. Currently, you race against an opposing bike to see which of you is eliminated first.

[**See it in action!**](https://youtu.be/B1_RzO_Boyo)

## Getting Started

To run the project:
- Set up your Oculus Rift, and install Chrome
- Install [Node.JS](https://nodejs.org) and Typescript (`npm i -g typescript`)
- Link the root directory to a web server such as Apache or NGINX
- Install dependencies: `npm i`
- Compile: `tsc`
- Open `index.html`

### Playing the game

- Once loaded into the browser, activate VR mode in the bottom right corner and  press any button on the keyboard or either controller to start. When you start, you'll immediately be facing the enemy lightcycle. Don't let them kill you!
- The bike, unsurprisingly, essentially works as a motorcycle. To accelerate, hold the right primary trigger down and tilt the controller away from your body.

### But what if I don't have a VR Headset?

That's okay (kind of)! In order to play without a VR headset you'll need to manually position the default camera to get a good viewport of the screen. (Click and drag to rotate the camera, and use the arrow keys to move it.)

Of course, the game isn't optimized for 2D play, and you really should use an Oculus.

## Contributions

**Alex Hicks** 
- Physics Handling *Acceleration, Velocity, etc*
- Trail Generation
- Collision Detection *Players, Enemies, Trails*
- Mesh rotation and bike physics
- VR Controller Handling
- AI *Targeting, Pathfinding, trail avoidance*
- VR Controller Handling

**Brian Huntley**
- Asset Generation *Player, Enemy, Floor, Walls*
- Game Start And Stop
- Trail Generation
- Collision Detection *Players, Enemies, Trails*
- AI *Targeting, Pathfinding, trail avoidance*
- Mesh Rotation physics models

## Bugs

- Collision detection on the walls does not work. This is due to the bounding box surrounding the entire mesh rather than each wall. Separating the walls from each other would fix this problem.
- The AI occasionally veers off into the void, and it's kind of a pain. For optimal enjoyment, each match should be ended quickly.
- Not quite a bug; there's no music.
