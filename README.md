# Chronal Decay

Chronal Decay is a 2D platformer built using JavaScript and Phaser that focuses on time manipulation systems, AI behavior, and multi-state gameplay logic.

## Overview

This project demonstrates advanced system design including a command-based replay system, finite state machine AI, and multi-layered gameplay mechanics. The project was made for a class assignment as a letter or postcard to someone you know, and Chronal Decay was geared towards my dad. Overall, it doesn't best fit the theme, which was the biggest fault here, as well as being geared way to much towards my father, rather than the grader for the assignment.

## Key Systems Built

### Time Manipulation System (Command Pattern)
- Recorded player input, position, and velocity over time
- Implemented rewind and replay functionality using stored frame data along with a double-pointer system
- Designed a Time Manager system to control recording, rewind, and playback states
### AI System (Finite State Machine)
- Designed multi-state AI: Patrol, Wait, Chase, Charge, Fire
- Controlled transitions using player distance, timers, and world state conditions
- Implemented adaptive behavior based on gameplay state (physical vs abstract world)
### Movement & Physics System
- Built acceleration-based movement instead of direct velocity control
- Prevented overshooting targets using dynamic speed adjustments
### Multi-Camera System
- Implemented layered camera system with overlays and selective rendering
## Command pattern implementation for time replay
- Finite state machine architecture for AI behavior
- Frame-based state tracking using delta time
- Modular system design across gameplay features

## My Takeways
### Gameplay
Despite being a technically difficult game, I didn't realize how difficult the game would be intuitively to understand. Talking to developers at GDC, after I had finished most of the game, really helped shed light on the core issues of Chronal Decay. The game took inspiration from temporal mechanics, or at least my understanding of it. If time were to be able to be frozen, then that would include light particles, meaning no sight of anything around you unless you were to move against the light, and the game demonstrates this idea through a stretch modifier for the world. Of course, the effect would be limited and not instant due to playability reasons. Besides the visual side, forcing the player to have to go back to their past self after rewinding time, in order to continue back in linear time, felt interesting and fun, but due to the gameplay, became confusing. 

On the AI side, I wanted to do more with the eye, but due to time restrictions, it has a very rough foundation. There was supposed to be a system similar to Alien Isolation, where there are two AIs running parallel, one for large distance, one for close with a hint system. Because I stuck with a very basic randomized value, the average randomized positions, ended up resulting in a traversal path which often collided with the player, creating an incredibly difficult enemy to beat. The swirl effect, although fun to look at, ended up being an overload of visuals when mixed with the stretched world. One detail I did enjoy, was having the enemy AI chase your past version in linear time.

### Setting
The setting reused assets from Blade Cycle, mainly because the professor allowed us to reuse assets, and due to GDC, I had little time. Trying to make a game be similar to a postcard, but with the assets of Blade Cycle was incredibly difficult. Furthermore, I had geared the game and theme around my father, which when this project was graded, ended up being incredibly confusing because the audience the game was made for was incredibly specific with niche details and conceptual understandings of time. 

### Code Patterns
For the project I referred to many different coding patterns, in this case it was the Command Pattern mixed with, another pattern I forgot the name of, for the mechanic of rewinding and replaying time. Personally, I love researching these patterns and methods because often times, many programming patterns (either one or a mixture), solve issues in game development. In fact, many games would probably benefit if more of their code was released publicly, since many solutions are often lost overtime. 


# Running the Project
To run the project in your local environment, follow either these two steps:
Quick Method:
  1) Access the github pages for Blade Cycle
  2) Click and run the link for the page

Longer Method:
  1) Clone the repository to your local machine.
  2) Run VScode.
  3) Download the live server extension.
  4) Run the live server on your local machine.
