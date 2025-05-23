const FONT = [
    [0xF0, 0x90, 0x90, 0x90, 0xF0], // 0
    [0x20, 0x60, 0x20, 0x20, 0x70], // 1
    [0xF0, 0x10, 0xF0, 0x80, 0xF0], // 2
    [0xF0, 0x10, 0xF0, 0x10, 0xF0], // 3
    [0x90, 0x90, 0xF0, 0x10, 0x10], // 4
    [0xF0, 0x80, 0xF0, 0x10, 0xF0], // 5
    [0xF0, 0x80, 0xF0, 0x90, 0xF0], // 6
    [0xF0, 0x10, 0x20, 0x40, 0x40], // 7
    [0xF0, 0x90, 0xF0, 0x90, 0xF0], // 8
    [0xF0, 0x90, 0xF0, 0x10, 0xF0], // 9
    [0xF0, 0x90, 0xF0, 0x90, 0x90], // A
    [0xE0, 0x90, 0xE0, 0x90, 0xE0], // B
    [0xF0, 0x80, 0x80, 0x80, 0xF0], // C
    [0xE0, 0x90, 0x90, 0x90, 0xE0], // D
    [0xF0, 0x80, 0xF0, 0x80, 0xF0], // E
    [0xF0, 0x80, 0xF0, 0x80, 0x80]  // F
]

class Memory {
    constructor() {
        this.memory = [];
        for(let i = 0; i<4096; i++) {
            this.memory.push(0x00);
        }
    }

    set(addr, value) {
        this.memory[addr] = value;
    }

    get(addr) {
        return this.memory[addr];
    }

    load(addr, values) {
        for(let i=0; i<values.length; i++) {
            this.set(addr+i, values[i]);
        }
    }
}

class Stack {
    constructor() {
        this.stack = []
    }

    push(value) {
        this.stack.push(value);
    }

    pop() {
        return this.stack.pop();
    }
}

class Timer {
    constructor() {
        this.value = 0x00;
        setInterval(()=>{
            this.decrement();
        }, 17)
    }

    set(value) {
        this.value = value;
    }

    get() {
        return this.value;
    }

    decrement() {
        if(this.value>0){
            this.value -= 0x01;
        }
    }
}

class SoundTimer extends Timer{
    decrement() {
        if(this.value>0){
            console.log("BEEP")
            this.value -= 0x01;
        }
    }
}

class Display {
    constructor() {
        this.pixels = []
        for(let i = 0; i<32; i++) {
            this.pixels.push([])
            for(let j = 0; j<64; j++) {
                this.pixels[i].push(0x00);
            }
        };
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        for(let i = 0; i<32; i++) {
            for(let j = 0; j<64; j++) {
                this.pixels[i][j] = 0x00;
            }
        };
    }

    render() {
        const width = 640;
        const height = 320;
        const imgData = this.ctx.createImageData(width, height);
        const data = imgData.data;

        for(let i = 0; i < 32; i++) {
            for(let j = 0; j < 64; j++) {
            const value = this.pixels[i][j] === 1 ? 255 : 0;
            for(let dy = 0; dy < 10; dy++) {
                for(let dx = 0; dx < 10; dx++) {
                const x = j * 10 + dx;
                const y = i * 10 + dy;
                const index = (y * width + x) * 4;
                data[index] = value;
                data[index + 1] = value;
                data[index + 2] = value;
                data[index + 3] = 255;
                }
            }
            }
        }
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.putImageData(imgData, 0, 0);
    }
        
}

class Chip8 {
    constructor(){
        this.reset();
    }

    reset() {
        // Memory elements
        this.memory = new Memory();
        this.stack = new Stack();

        // Timers
        this.delayTimer = new Timer();
        this.soundTimer = new SoundTimer();

        // Program counter
        this.PC = 0x0200;
        
        // Index register
        this.I = 0x0000;

        // Registers
        this.V = [
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
        ]

        this.display = new Display();

        // Load fonts into memory starting at address 0x050
        for(let i = 0; i<FONT.length; i++){
            const fontStartAddr = 0x050+(i*FONT[i].length);
            this.memory.load(fontStartAddr, FONT[i]);
        }
    }

    fetch() {
        let i1 = this.memory.get(this.PC);
        let i2 = this.memory.get(this.PC + 0x0001)
        this.PC += 0x0002;
        return (i1<<8) | i2;
    }

    decode_and_execute(instruction) {
        const opcode = instruction >> 12;
        const X = instruction >> 8 & 0x000F;
        const Y = instruction >> 4 & 0x000F;
        const N = instruction & 0x000F;
        const NN = instruction & 0x00FF;
        const NNN = instruction & 0x0FFF;
        switch(opcode) {
            case 0x0:
                if(instruction === 0x00E0) {
                    this.display.clear();
                }else if(instruction === 0x00EE) {
                    this.PC = this.stack.pop();
                }
                break;
            case 0x1:
                this.PC = NNN;
                break;
            case 0x2:
                this.stack.push(this.PC);
                this.PC = NNN;
                break;
            case 0x3:
                if(this.V[X] === NN) {
                    this.PC += 2;
                }
                break;
            case 0x4:
                if(this.V[X] !== NN) {
                    this.PC += 2;
                }
                break;
            case 0x5:
                if(this.V[X] === this.V[Y]) {
                    this.PC += 2;
                }
                break;
            case 0x6:
                this.V[X] = NN;
                break;
            case 0x7:
                this.V[X] = (this.V[X] + NN) & 255;
                break;
            case 0x8:
                switch(N) {
                    case 0:
                        this.V[X] = this.V[Y];
                        break;
                    case 1:
                        this.V[X] = this.V[X] | this.V[Y];
                        break;
                    case 2:
                        this.V[X] = this.V[X] & this.V[Y];
                        break;
                    case 3:
                        this.V[X] = this.V[X] ^ this.V[Y];
                        break;
                    case 4:
                        this.V[X] += this.V[Y];
                        if(this.V[X] > 255) {
                            this.V[X] = this.V[X] & 255;
                            this.V[0xF] = 1;
                        } else {
                            this.V[0xF] = 0;
                        }
                        break;
                    case 5:
                        if(this.V[X] >= this.V[Y]) {
                            this.V[X] = this.V[X] - this.V[Y];
                            this.V[0xF] = 1;
                        } else {
                            this.V[X] = 256 + (this.V[X] - this.V[Y])
                            this.V[0xF] = 0;
                        }
                        break;
                    case 6:
                        this.V[X] = this.V[Y];
                        let f6 = this.V[X] & 1;
                        this.V[X] = this.V[X] >> 1;
                        this.V[0xF] = f6;
                        break;
                    case 7:
                        if(this.V[Y] >= this.V[X]) {
                            this.V[X] = this.V[Y] - this.V[X];
                            this.V[0xF] = 1;
                        } else {
                            this.V[X] = 256 + (this.V[Y] - this.V[X])
                            this.V[0xF] = 0;
                        }
                        break;
                    case 0xE:
                        this.V[X] = this.V[Y];
                        let fE = (this.V[X] >> 7) & 0x1;
                        this.V[X] = (this.V[X] << 1) & 0xFF;
                        this.V[0xF] = fE;
                        break;
                }
                break;
            case 0x9:
                if(this.V[X] !== this.V[Y]) {
                    this.PC += 2;
                }
                break;
            case 0xA:
                this.I = NNN;
                break;
            case 0xB:
                this.PC = NNN + this.V[0x0];
                break;
            case 0xC:
                const random = Math.floor(Math.random() * 100);
                this.V[X] = random & NN;
                break;
            case 0xD:
                let YCoord = this.V[Y]&31;
                this.V[0xF] = 0;

                for(let i = 0; i<N; i++) {
                    let XCoord = this.V[X]&63;
                    const line = this.memory.get(this.I+i);
                    for(let p = 0; p < 8; p++) {
                        let pixel = line & (1 << (7-p)) ? 1 : 0;
                        if(this.display.pixels[YCoord][XCoord] === 1 && pixel === 1) {
                            this.display.pixels[YCoord][XCoord] = 0;
                            this.V[0xF] = 0x1;
                        }else if(this.display.pixels[YCoord][XCoord] === 0 && pixel === 1) {
                            this.display.pixels[YCoord][XCoord] = 0x1;
                        }else if(this.display.pixels[YCoord][XCoord] === 0 && pixel === 0){
                            this.display.pixels[YCoord][XCoord] = 0;
                        }
                        XCoord++;
                    }
                    YCoord++;
                }
                break;
            case 0xE:
                switch(NN){
                    case 0x9E:
                        if(this.keyPressed === this.V[X]){
                            this.PC += 2;
                        }
                        break;
                    case 0xA1:
                        if(this.keyPressed != this.V[X]){
                            this.PC += 2;
                        }
                }
                break;
            case 0xF:
                switch(NN) {
                    case 0x0A:
                        if(!this.keyPressed){
                            this.PC -= 2;
                        }else{
                            this.V[X] = this.keyPressed;
                        }
                        break;
                    case 0x33:
                        let number = this.V[X];
                        for(let i=2; i>=0; i--) {
                            this.memory.set(this.I+i, number>0?number%10:0); 
                            if(number>0){
                                number = Math.floor(number/10);
                            }
                        }
                        break;
                    case 0x55:
                        for(let i=0; i<=X; i++){
                            this.memory.set(this.I+i, this.V[i]);
                        }
                        break;
                    case 0x65:
                        for(let i=0; i<=X; i++){
                            this.V[i] = this.memory.get(this.I+i);
                        }
                        break;
                    case 0x07:
                        this.V[X] = this.delayTimer.get();
                        break;
                    case 0x15:
                        this.delayTimer.set(this.V[X]);
                        break;
                    case 0x18:
                        this.soundTimer.set(this.V[X]);
                        break;
                    case 0x1E:
                        this.I += this.V[X];
                        break;
                }
                break;
        }
    }

    getKeyHexValue(key) {
        switch(key) {
            case 49:
                return 0x1;
            case 50:
                return 0x2;
            case 51:
                return 0x3;
            case 52:
                return 0xC;
            case 81:
                return 0x4;
            case 87:
                return 0x5;
            case 69:
                return 0x6;
            case 82:
                return 0xD;
            case 65:
                return 0x7;
            case 83:
                return 0x8;
            case 68:
                return 0x9;
            case 70:
                return 0xE;
            case 90:
                return 0xA;
            case 88:
                return 0x0;
            case 67:
                return 0xB;
            case 86:
                return 0xF;
        }
    }

    run(rom) {
        this.reset();

        this.memory.load(0x200, rom);

        document.addEventListener('keydown', (ev)=>{
            this.keyPressed = this.getKeyHexValue(ev.keyCode);
        });

        document.addEventListener('keyup', (ev) => {
            this.keyPressed = null;
        })

        const step = () => {
            let instruction = this.fetch();
            this.decode_and_execute(instruction);
            this.display.render();
        }
        
        setInterval(step, 0);
    }
}