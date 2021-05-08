import { C_Major_44_1, C_Major_48 } from "./testSignals";
import { Chromagram } from "../src/Chromagram";
import { ChordDetector, ChordQuality } from "../src/ChordDetector";
import { detectChords, prettifyChord, RootNotes } from "../src/main";

test("test CMajor44100kHz", () => {
    let frameSize = 1024;

    let c = new Chromagram(frameSize, 44100);

    let frame = new Array(frameSize);

    for (let i = 0; i < 8192; i = i + frameSize) {
        for (let k = 0; k < frameSize; k++) {
            frame[k] = C_Major_44_1[i + k];
        }

        c.processAudioFrame(frame);
        if (c.isReady()) {
            let chroma = c.getChromagram();

            expect(chroma[0]).toBeGreaterThan(chroma[1]);
            expect(chroma[0]).toBeGreaterThan(chroma[2]);
            expect(chroma[0]).toBeGreaterThan(chroma[3]);
            expect(chroma[0]).toBeGreaterThan(chroma[5]);
            expect(chroma[0]).toBeGreaterThan(chroma[6]);
            expect(chroma[0]).toBeGreaterThan(chroma[8]);
            expect(chroma[0]).toBeGreaterThan(chroma[9]);
            expect(chroma[0]).toBeGreaterThan(chroma[10]);
            expect(chroma[0]).toBeGreaterThan(chroma[11]);

            expect(chroma[4]).toBeGreaterThan(chroma[1]);
            expect(chroma[4]).toBeGreaterThan(chroma[2]);
            expect(chroma[4]).toBeGreaterThan(chroma[3]);
            expect(chroma[4]).toBeGreaterThan(chroma[5]);
            expect(chroma[4]).toBeGreaterThan(chroma[6]);
            expect(chroma[4]).toBeGreaterThan(chroma[8]);
            expect(chroma[4]).toBeGreaterThan(chroma[9]);
            expect(chroma[4]).toBeGreaterThan(chroma[10]);
            expect(chroma[4]).toBeGreaterThan(chroma[11]);

            expect(chroma[7]).toBeGreaterThan(chroma[1]);
            expect(chroma[7]).toBeGreaterThan(chroma[2]);
            expect(chroma[7]).toBeGreaterThan(chroma[3]);
            expect(chroma[7]).toBeGreaterThan(chroma[5]);
            expect(chroma[7]).toBeGreaterThan(chroma[6]);
            expect(chroma[7]).toBeGreaterThan(chroma[8]);
            expect(chroma[7]).toBeGreaterThan(chroma[9]);
            expect(chroma[7]).toBeGreaterThan(chroma[10]);
            expect(chroma[7]).toBeGreaterThan(chroma[11]);
        }
    }
});

test("test CMajor48kHz", () => {
    let frameSize = 1024;

    let c = new Chromagram(frameSize, 48000);

    let frame = new Array(frameSize);

    for (let i = 0; i < 8192; i = i + frameSize) {
        for (let k = 0; k < frameSize; k++) {
            frame[k] = C_Major_48[i + k];
        }

        c.processAudioFrame(frame);

        if (c.isReady()) {
            let chroma = c.getChromagram();

            expect(chroma[0]).toBeGreaterThan(chroma[1]);
            expect(chroma[0]).toBeGreaterThan(chroma[2]);
            expect(chroma[0]).toBeGreaterThan(chroma[3]);
            expect(chroma[0]).toBeGreaterThan(chroma[5]);
            expect(chroma[0]).toBeGreaterThan(chroma[6]);
            expect(chroma[0]).toBeGreaterThan(chroma[8]);
            expect(chroma[0]).toBeGreaterThan(chroma[9]);
            expect(chroma[0]).toBeGreaterThan(chroma[10]);
            expect(chroma[0]).toBeGreaterThan(chroma[11]);

            expect(chroma[4]).toBeGreaterThan(chroma[1]);
            expect(chroma[4]).toBeGreaterThan(chroma[2]);
            expect(chroma[4]).toBeGreaterThan(chroma[3]);
            expect(chroma[4]).toBeGreaterThan(chroma[5]);
            expect(chroma[4]).toBeGreaterThan(chroma[6]);
            expect(chroma[4]).toBeGreaterThan(chroma[8]);
            expect(chroma[4]).toBeGreaterThan(chroma[9]);
            expect(chroma[4]).toBeGreaterThan(chroma[10]);
            expect(chroma[4]).toBeGreaterThan(chroma[11]);

            expect(chroma[7]).toBeGreaterThan(chroma[1]);
            expect(chroma[7]).toBeGreaterThan(chroma[2]);
            expect(chroma[7]).toBeGreaterThan(chroma[3]);
            expect(chroma[7]).toBeGreaterThan(chroma[5]);
            expect(chroma[7]).toBeGreaterThan(chroma[6]);
            expect(chroma[7]).toBeGreaterThan(chroma[8]);
            expect(chroma[7]).toBeGreaterThan(chroma[9]);
            expect(chroma[7]).toBeGreaterThan(chroma[10]);
            expect(chroma[7]).toBeGreaterThan(chroma[11]);
        }
    }
});

test("test CMajor", () => {
    let chordDetector = new ChordDetector();

    let chroma = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];

    chordDetector.detectChord(chroma);

    expect(chordDetector.rootNote).toEqual(0);
    expect(chordDetector.quality).toEqual(ChordQuality.Major);
    expect(chordDetector.intervals).toEqual(0);
});

test("test CMinor", () => {
    let chordDetector = new ChordDetector();

    let chroma = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0];

    chordDetector.detectChord(chroma);

    expect(chordDetector.rootNote).toEqual(0);
    expect(chordDetector.quality).toEqual(ChordQuality.Minor);
    expect(chordDetector.intervals).toEqual(0);
});

test("test prettifyChord", () => {
    let chordDetector = new ChordDetector();

    let chroma = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0];

    chordDetector.detectChord(chroma);

    expect(prettifyChord(0, 1, 0)).toEqual({
        rootNote: "C",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(1, 1, 0)).toEqual({
        rootNote: "C#/Db",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(2, 2, 0)).toEqual({
        rootNote: "D",
        quality: 2,
        interval: 0,
    });
    expect(prettifyChord(3, 1, 0)).toEqual({
        rootNote: "D#/Eb",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(4, 1, 0)).toEqual({
        rootNote: "E",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(5, 1, 0)).toEqual({
        rootNote: "F",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(6, 1, 0)).toEqual({
        rootNote: "F#/Gb",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(7, 1, 0)).toEqual({
        rootNote: "G",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(8, 1, 0)).toEqual({
        rootNote: "G#/Ab",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(9, 1, 0)).toEqual({
        rootNote: "A",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(10, 1, 0)).toEqual({
        rootNote: "A#/Bb",
        quality: 1,
        interval: 0,
    });
    expect(prettifyChord(11, 1, 0)).toEqual({
        rootNote: "B",
        quality: 1,
        interval: 0,
    });
});

test("Test detectChords", () => {
    let chords = detectChords(C_Major_48, 44100);
    chords.map((c) => {
        expect(c.rootNote).toEqual("C");
    });
});
