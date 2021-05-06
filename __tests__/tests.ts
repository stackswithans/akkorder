import { C_Major_44_1, C_Major_48 } from "./testSignals";
import { Chromagram } from "../src/Chromagram";
import { ChordDetector, ChordQuality } from "../src/ChordDetector";

test("test CMajor441kHz", () => {
    let frameSize = 1024;

    let c = new Chromagram(frameSize, 44100);

    let frame = new Float32Array(frameSize);

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

    let frame = new Float32Array(frameSize);

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
