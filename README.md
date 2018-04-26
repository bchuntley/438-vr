# TRON-VR

#### See it in action!  https://www.youtube.com/watch?v=B1_RzO_Boyo&feature=youtu.be

- TRON-VR is a web-based vr implementation of the lightcycles from TRON. Currently, you race against a fellow bike to see who can eliminate the other one first.

## Getting Started

To run the project, simply add the directory to a file server such as Node.js or XAMPP, and install the NPM dependencies.

### Prerequisites

- An Oculus Rift. (Obviously). Other VR headsets will not work, as the buttons and actions are not mapped.
- Node.js

### Playing the game

- Once loaded into the browser, activate VR mode in the bottom right corner and  press any button on the keyboard or either controller to start. When you start, you'll immediately be facing the enemy lightcycle. Don't let them kill you!

- The bike, unsurprisingly, essentially works as a motorcycle. In order to accelerate 

### But what if I don't have a VR Headset?

- Thats okay! Kind of! In order to play without a VR headset you'll need to manually position the default camera to get a good viewport of the screen.

## Authors & Their Contributions

* **Alex Hicks** 
	* Physics Handling *Acceleration, Velocity, etc*
	* Trail Generation
	* Collision Detection *Players, Enemies, Trails*
	* Mesh rotation and bike physics
	* VR Controller Handling
	* AI *Targeting, Pathfinding, trail avoidance*
	* VR Controller Handling
* **Brian Huntley**
	* Asset Generation *Player, Enemy, Floor, Walls*
	* Game Start And Stop
	* Trail Generation
	* Collision Detection *Players, Enemies, Trails*
	* VR Camera Handling
	* AI *Targeting, Pathfinding, trail avoidance*
	* Mesh Rotation physics models

## Bugs!

* Collision Detection on the walls does not work. This is due to the bounding box surrounding the entire mesh rather than each wall. Simply seperating the walls will fix this problem. 
* The AI *works*, thats all I can say about it. 
* Theres no whispy tron-esque music. 