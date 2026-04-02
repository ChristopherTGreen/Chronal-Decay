# Chronal Decay

Chronal Decay is a 2D platformer built using JavaScript and Phaser that focuses on time manipulation systems, AI behavior, and multi-state gameplay logic.

## Overview

This project demonstrates advanced system design including a command-based replay system, finite state machine AI, and multi-layered gameplay mechanics.

## Key Systems Built

### Time Manipulation System (Command Pattern)
- Recorded player input, position, and velocity over time
- Implemented rewind and replay functionality using stored frame data
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
Technical Highlights

## Command pattern implementation for time replay
- Finite state machine architecture for AI behavior
- Frame-based state tracking using delta time
- Modular system design across gameplay features
