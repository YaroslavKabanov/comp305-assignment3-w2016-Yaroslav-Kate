//*********************************************************************
//Source file: keyboardcontrols.ts                                    *
//Authors names:Yaroslav Kabanov                                      *
//              Kateryna Bilokhvost                                   *
//Initial commit: March 10, 2016                                      *
//Last modified by: Kateryna Bilokhvost                               *
//Last date modified: March 24, 2016                                  *
//Commit history: GitHub Link: https://github.com/YaroslavKabanov/    *
//comp305-assignment3-w2016-Yaroslav-Kate/commits/master              *
//                                                                    *
//Program description: This is the basic Three.js based first         *
//person perspective game which is challenging player to escape       *
//the mysterious maze with numerous traps before the time             *
// elapses. Bonus items are hidden in the maze for extra time.        *
//*********************************************************************
module objects {
    // KeyboardControls Class +++++++++++++++
    export class KeyboardControls {
        // PUBLIC INSTANCE VARIABLES ++++++++++++
        public moveForward: boolean;
        public moveBackward: boolean;
        public moveLeft: boolean;
        public moveRight: boolean;
        public jump: boolean;
        public enabled: boolean;
        // CONSTRUCTOR ++++++++++++++++++++++++++    
        constructor() {
            this.enabled = false;
            document.addEventListener('keydown', this.onKeyDown.bind(this), false);
            document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        }

        // PUBLIC METHODS
        
        public onKeyDown(event: KeyboardEvent): void {
            switch (event.keyCode) {
                case 38: /*up arrow*/
                case 87: /* W Key */
                    this.moveForward = true;
                    break;
                case 37: /*left arrow*/
                case 65: /* A Key */
                    this.moveLeft = true;
                    break;
                case 40: /*down arrow*/
                case 83: /* S Key */
                    this.moveBackward = true;
                    break;
                case 39: /*right arrow*/
                case 68: /* D Key */
                    this.moveRight = true;
                    break;
                case 32: /* Spacebar */
                    this.jump = true;
                    break;
            }
        }

        public onKeyUp(event: KeyboardEvent): void {
            switch (event.keyCode) {
                case 38: /*up arrow*/
                case 87: /* W Key */
                    this.moveForward = false;
                    break;
                case 37: /*left arrow*/
                case 65: /* A Key */
                    this.moveLeft = false;
                    break;
                case 40: /*down arrow*/
                case 83: /* S Key */
                    this.moveBackward = false;
                    break;
                case 39: /*right arrow*/
                case 68: /* D Key */
                    this.moveRight = false;
                    break;
                case 32: /* Spacebar */
                    this.jump = false;
                    break;
            }
        }
    }
}