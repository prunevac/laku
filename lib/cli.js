const {EventEmitter} = require('events');
const readline = require('readline');

const ARROW_UP = '\x1B[A';
const ARROW_DOWN = '\x1B[B';
const ENTER = '\x0D';
const CTRLC = '\x03';
const highlight = (str) => `${makeBold(str)} <-`;
const write = (str, xoffset) => {
    if (xoffset !== undefined) {
        process.stdout.cursorTo(xoffset);
    }
    process.stdout.write(str);
};
const newline = () => write('\n');
const hideCursor = () => write('\x1B[?25l');
const showCursor = () => write('\x1B[?25h');
const makeBold = (str) => `\x1b[1m${str}\x1b[22m`;
const CHOICES_ON_SCREEN = 7;

/**
 * todo proper jsdoc - no time :(
 * @param question
 * @param options
 * @param pointer
 * @returns {Promise<unknown>}
 */
const select = (question, options, pointer) => {
    if (!process.stdin.isTTY) {
        throw new Error('process stdin is not tty (the script is run via child process probably..)');
    }

    const emitter = new EventEmitter();
    const opts = options.map((o) => `> ${o}`);
    let currentPointer;
    let visibleRange;

    function dataHandler(character) {
        switch (character) {
            case ARROW_UP:
                up();
                break;
            case ARROW_DOWN:
                down();
                break;
            case ENTER:
                enter();
                break;
            case CTRLC:
                ctrlc();
                break;
        }
    }

    const up = () => {
        process.stdout.moveCursor(0, visibleRange[0]-currentPointer);
        if (currentPointer === 0) {
            currentPointer = opts.length - 1;
        } else {
            currentPointer--;
        }
        rePrint()
    };

    const down = () => {
        process.stdout.moveCursor(0, visibleRange[0]-currentPointer);
        if (currentPointer === opts.length - 1) {
            currentPointer = 0;
        } else {
            currentPointer++;
        }
        rePrint()
    };

    const enter = () => {
        process.stdin.removeListener('data', dataHandler);
        process.stdin.setRawMode(false);
        if (!process.stdin.isPaused()) {
            process.stdin.pause();
        }
        process.stdout.moveCursor(0, visibleRange[1] - currentPointer);
        showCursor();
        newline();
        emitter.emit('selection', options[currentPointer]);
    };

    const ctrlc = () => {
        process.stdout.moveCursor(0, opts.length - currentPointer);
        newline();
        write('EXIT..');
        newline();
        process.exit(0);
    };

    const rePrint = () => {
        if (currentPointer < visibleRange[0]) {
            visibleRange = [currentPointer, currentPointer + CHOICES_ON_SCREEN - 1];
        }
        if (currentPointer > visibleRange[1]) {
            visibleRange = [currentPointer - CHOICES_ON_SCREEN + 1, currentPointer];
        }

        for (let i = visibleRange[0]; i <= visibleRange[1]; i++) {
            if(i===options.length) {
                break;
            }
            process.stdout.clearLine(0);
            if(i===currentPointer) {
                write(highlight(options[i]));
            } else {
                write(options[i])
            }
            if(i!==options.length-1 && i !== visibleRange[1]) {
                newline();
            }
        }
        process.stdout.moveCursor(0, currentPointer - visibleRange[1]);
        process.stdout.cursorTo(0);
    };

    write(question);
    newline();
    if(CHOICES_ON_SCREEN<options.length) {
        write(' some options did not fit on screen');
        newline();
        write(' (they can still be selected by scrolling)');
        newline();
    }
    currentPointer = pointer ?? 0;
    if (currentPointer > CHOICES_ON_SCREEN) {
        currentPointer = CHOICES_ON_SCREEN;
    }
    const range1 = CHOICES_ON_SCREEN < options.length ? CHOICES_ON_SCREEN : options.length;
    visibleRange = [0,  range1-1];
    rePrint();

    process.stdin.setRawMode(true);
    if (process.stdin.isPaused()) {
        process.stdin.resume();
    }
    process.stdin.setEncoding('utf-8');
    hideCursor();
    process.stdin.on('data', dataHandler);
    return new Promise((resolve) => {
        emitter.on('selection', (selection) => resolve(selection));
    });
};

/**
 * todo proper jsdoc - no time :(
 * @param question
 * @param invalidWarning
 * @param defaultValue
 * @param validationCallback
 * @returns {Promise<unknown>}
 */
const input = ({question, invalidWarning, defaultValue, validationCallback = () => true}) => {
    const emitter = new EventEmitter();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const ask = () => {
        const qstn = defaultValue ? `${question} [${defaultValue}]` : question;
        rl.question(`${qstn}: `, (answer) => {
            const isDefaultAnswer = defaultValue && answer === '';
            if (isDefaultAnswer) {
                emitter.emit('selection', defaultValue);
                rl.close();
                return;
            }
            if (validationCallback(answer)) {
                emitter.emit('selection', answer);
                rl.close();
            } else {
                console.log(invalidWarning || 'invalid answer');
                ask();
            }
        });
    };
    ask();

    return new Promise((resolve) => {
        emitter.on('selection', (selection) => resolve(selection));
    });
};

module.exports = {
    input,
    select,
};
