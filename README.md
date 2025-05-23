# chip8-js
A vanilla JavaScript Chip8 emulator/interpreter

### [Try it here](https://sinthteck.github.io/chip8-js/)

### Description
Just as mentioned above, this is a *very simple* vanilla JS Chip8 emulator/interpreter which I decided to implement just for the sake of curiosity. I saw everyone mentioning how easy it is to implement a Chip8 interpreter, so I thought I'd give it a shot using a language which is the furthest thing to being the optimal choice for this purpose.

I tried to keep the implementation as simple as possible: the whole logic is contained in a single file and is less than 450 LOC. I think it could be helpful for anyone who is approaching this challenge and needs to take a peek at the logic without having to strugle too much to understand the project structure: **this implementation is as simple as it gets**!

Was it easy? Yeah, kinda. But what made it so easy was following Tobias V. Langhoff's [guide](https://tobiasvl.github.io/blog/write-a-chip-8-emulator/). It provides the right level of specifications without giving away any implementation detail. It made it feel like I was working on a puzzle, great starting point.

### Notes

This project was developed without the use of any AI assistance tool (really, no ChatGPT, no Claude, just good old fashioned googling). Each letter that you are reading (even these ones lol) have been typed entirely by human fingers. I know, weird flex.

The emulator might not be perfect: it has been tested against the most common test ROMs and using games and demos, but I might have missed some edge case. If you see any issue, please report it to me so I can update the code.

### Known issues
- Sound is not working: since this was implemented in vanilla JS, I haven't been able to trigger sound programmatically. I worked around this by logging a nice "BEEP" in the console for every tick the sound would have been played for. Cute, right?
- Performance is not the best: you might find around other emulators with better performance. If you have any idea on how I can improve performance without adding complexity to the code, suggestions are very welcome!


