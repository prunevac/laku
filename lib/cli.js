const {EventEmitter} = require('events');
const readline = require('readline');

const ARROW_UP = '\x1B[A';
const ARROW_DOWN = '\x1B[B';
const ENTER = '\x0D';
const CTRLC = '\x03';
const DELETE = '\x1B[3~';
const BACKSPACE = '\b';
const ARROW_LEFT = '\x1B[D';
const ARROW_RIGHT = '\x1B[C';
const highlight = (str) => `${makeBold(str)} <-`;
const write = (str) => process.stdout.write(str);
const newline = () => write('\n');
const hideCursor = () => write('\x1B[?25l');
const showCursor = () => write('\x1B[?25h');
const makeBold = (str) => `\x1b[1m${str}\x1b[22m`;
const CHOICES_ON_SCREEN = 7;
const AUTOCOMPLETE_LABEL = '>>> autocomplete: ';

/**
 * todo proper jsdoc - no time :(
 * @param question
 * @param options
 * @param pointer
 * @param autocomplete
 * @returns {Promise<unknown>}
 */
const select = ({question, options, pointer, autocomplete}) => {
    if (!process.stdin.isTTY) {
        throw new Error('process stdin is not tty (the script is run via child process probably..)');
    }

    const emitter = new EventEmitter();
    let opts = options.map((o) => `> ${o}`);
    let currentPointer;
    let visibleRange;
    let autocompleteString = '';
    let autoCompleteStringPointer = 0;
    let invalidSelection = false;

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
            default:
                autocompleteHandler(character);
        }
    }

    const isAutocompleteActive = () => autocomplete && autocompleteString;

    const doAutoComplete = () => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        write(AUTOCOMPLETE_LABEL);
        write(autocompleteString);
        process.stdout.cursorTo(AUTOCOMPLETE_LABEL.length + autoCompleteStringPointer);
        opts = options.filter(o => o.includes(autocompleteString)).map((o) => `> ${o}`);

        // opts.splice(CHOICES_ON_SCREEN);
        if (opts.length === 0) {
            invalidSelection = true;
            opts = ['> no option matches the filter'];
        } else {
            invalidSelection = false;
        }
        visibleRange = [0, opts.length > CHOICES_ON_SCREEN ? CHOICES_ON_SCREEN - 1 : opts.length - 1];
        currentPointer = 0;
        rePrint();
    };

    // this harakiri has to be done when there are more options than is showed on the screen and the autocomplete is on
    const redoAutocomplete = (shift) => {
        if (shift === 'down' && currentPointer === CHOICES_ON_SCREEN - 1) {
            const allOpts = options.filter(o => o.includes(autocompleteString)).map((o) => `> ${o}`);
            if (allOpts.length > CHOICES_ON_SCREEN) {
                const idx = allOpts.findIndex(o => o === opts[CHOICES_ON_SCREEN - 1]);
                if (idx === allOpts.length - 1) {
                    opts = allOpts.slice(0, CHOICES_ON_SCREEN);
                } else {
                    opts = allOpts.slice(idx - CHOICES_ON_SCREEN + 2, idx + 2);
                    currentPointer = CHOICES_ON_SCREEN - 1;
                    return true;
                }
            }
        }
        if (shift === 'up' && currentPointer === 0) {
            const allOpts = options.filter(o => o.includes(autocompleteString)).map((o) => `> ${o}`);
            if (allOpts.length > CHOICES_ON_SCREEN) {
                const idx = allOpts.findIndex(o => o === opts[0]);
                if (idx === 0) {
                    opts = allOpts.slice(allOpts.length - CHOICES_ON_SCREEN);
                } else {
                    opts = allOpts.slice(idx - 1, idx + CHOICES_ON_SCREEN - 1);
                    currentPointer = 0;
                    return true;
                }
            }
        }
    };

    const autocompleteHandler = (character) => {
        if (!autocomplete) {
            return;
        }
        switch (character) {
            case ARROW_LEFT:
                if (autoCompleteStringPointer !== 0) {
                    autoCompleteStringPointer--;
                    process.stdout.moveCursor(-1);
                }
                break;
            case ARROW_RIGHT:
                if (autoCompleteStringPointer !== autocompleteString.length) {
                    autoCompleteStringPointer++;
                    process.stdout.moveCursor(1);
                }
                break;
            case DELETE:
                if (autoCompleteStringPointer !== autocompleteString.length) {
                    autocompleteString = autocompleteString.substring(0, autoCompleteStringPointer) + autocompleteString.substring(autoCompleteStringPointer + 1);
                    autoCompleteStringPointer--;
                    if (autoCompleteStringPointer < 0) {
                        autoCompleteStringPointer = 0;
                    }
                    doAutoComplete();
                }
                break;
            case BACKSPACE:
                if (autoCompleteStringPointer !== 0) {
                    autocompleteString = autocompleteString.substring(0, autoCompleteStringPointer - 1) + autocompleteString.substring(autoCompleteStringPointer);
                    autoCompleteStringPointer--;
                    doAutoComplete();
                }
                break;
            default:
                autocompleteString = autocompleteString.substring(0, autoCompleteStringPointer) + character + autocompleteString.substring(autoCompleteStringPointer);
                autoCompleteStringPointer++;
                doAutoComplete();
        }
    };

    const up = () => {
        if (currentPointer === 0) {
            recalcVisibleRangeOnArrowMovement('up');
            if (isAutocompleteActive()) {
                const pointerRecalculated = redoAutocomplete('up');
                if (!pointerRecalculated) {
                    currentPointer = visibleRange[1] === opts.length - 1 ? opts.length - 1 : 0;
                }
            } else {
                currentPointer = visibleRange[1] === options.length - 1 ? opts.length - 1 : 0;
            }
        } else {
            currentPointer--;
        }
        rePrint();
    };

    const down = () => {
        if (currentPointer === opts.length - 1) {
            recalcVisibleRangeOnArrowMovement('down');
            const pointerRecalculated = isAutocompleteActive() ? redoAutocomplete('down') : false;
            if (!pointerRecalculated) {
                currentPointer = visibleRange[0] === 0 ? 0 : opts.length - 1;
            }
        } else {
            currentPointer++;
        }
        rePrint();
    };

    const enter = () => {
        if (invalidSelection) {
            return;
        }
        process.stdin.removeListener('data', dataHandler);
        process.stdin.setRawMode(false);
        if (!process.stdin.isPaused()) {
            process.stdin.pause();
        }
        process.stdout.moveCursor(0, autocomplete ? opts.length : opts.length - 1);
        showCursor();
        newline();
        const selection = options.find(o => opts[currentPointer] === `> ${o}`);
        emitter.emit('selection', selection);
    };

    const ctrlc = () => {
        process.stdout.moveCursor(0, opts.length);
        newline();
        write('EXIT..');
        newline();
        process.exit(0);
    };

    const recalcVisibleRangeOnArrowMovement = (shift) => {
        if (isAutocompleteActive()) {
            recalcVisibleRangeOnArrowMovementGeneral(shift, opts);
        } else {
            recalcVisibleRangeOnArrowMovementGeneral(shift, options);
        }
    };

    const recalcVisibleRangeOnArrowMovementGeneral = (shift, decidingArray) => {
        // omg... it looked all so easy and pretty until i tried to make the autocomplete :((((
        if (CHOICES_ON_SCREEN >= decidingArray.length) {
            visibleRange = [0, decidingArray.length - 1];
            return;
        }
        if (shift === 'down') {
            if (visibleRange[1] === decidingArray.length - 1) { // overflow when coming down ("underflow" ?)
                visibleRange = [0, CHOICES_ON_SCREEN - 1];
            } else {
                visibleRange = [visibleRange[0] + 1, visibleRange[1] + 1];
            }
        }
        if (shift === 'up') {
            if (visibleRange[0] === 0) { // overflow when coming up
                visibleRange = [decidingArray.length - CHOICES_ON_SCREEN, decidingArray.length - 1];
            } else {
                visibleRange = [visibleRange[0] - 1, visibleRange[1] - 1];
            }
        }
    };

    const rePrint = () => {
        let printOpts;
        if (isAutocompleteActive()) {
            opts = opts.slice(visibleRange[0], visibleRange[1] + 1);
        } else {
            opts = options.slice(visibleRange[0], visibleRange[1] + 1).map((o) => `> ${o}`);
        }
        if (autocomplete) {
            process.stdout.moveCursor(0, 1);
        }

        opts.forEach((opt, i) => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            if (i === currentPointer) {
                write(highlight(opts[i]));
            } else {
                write(opts[i]);
            }
            if (i !== opts.length - 1)
                newline();
        });

        process.stdout.clearScreenDown();
        const shiftUp = opts.length < CHOICES_ON_SCREEN ? opts.length : CHOICES_ON_SCREEN;
        process.stdout.moveCursor(0, -shiftUp + 1);
        if (autocomplete) {
            process.stdout.moveCursor(0, -1);
            process.stdout.cursorTo(AUTOCOMPLETE_LABEL.length + autoCompleteStringPointer);
        }
    };

    write(question);
    newline();
    autocomplete && write(AUTOCOMPLETE_LABEL);
    currentPointer = pointer ?? 0;
    if (currentPointer > CHOICES_ON_SCREEN) {
        currentPointer = CHOICES_ON_SCREEN;
    }
    const range1 = CHOICES_ON_SCREEN < opts.length ? CHOICES_ON_SCREEN : opts.length;
    visibleRange = [0, range1 - 1];
    rePrint();

    process.stdin.setRawMode(true);
    if (process.stdin.isPaused()) {
        process.stdin.resume();
    }
    process.stdin.setEncoding('utf-8');
    !autocomplete && hideCursor();
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
