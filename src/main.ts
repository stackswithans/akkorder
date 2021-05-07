import { Chromagram } from "./Chromagram";
import { ChordDetector } from "./ChordDetector";

enum RootNotes {
    NC = "NC",
    C = "C",
    CSHARPDB = "C#/Db",
    D = "D",
    DSHARPEB = "D#/Eb",
    E = "E",
    F = "F",
    FSHARPGB = "F#/Gb",
    G = "G",
    GSHARPAB = "G#/Ab",
    A = "A",
    ASHARPBB = "A#/Bb",
    B = "B",
}

const notes = [
    RootNotes.C,
    RootNotes.CSHARPDB,
    RootNotes.D,
    RootNotes.DSHARPEB,
    RootNotes.E,
    RootNotes.F,
    RootNotes.FSHARPGB,
    RootNotes.G,
    RootNotes.GSHARPAB,
    RootNotes.A,
    RootNotes.ASHARPBB,
    RootNotes.B,
];

type Chord = { rootNote: RootNotes; quality: number; interval: number };

export default class Akkorder {
    private detector: ChordDetector;
    private chroma_builder: Chromagram;
    private frameSize: number;

    constructor(frameSize: number, sampleRate: number) {
        this.frameSize = frameSize;
        this.chroma_builder = new Chromagram(frameSize, sampleRate);
        this.detector = new ChordDetector();
    }

    public prettifyChord(
        rootNote: number,
        quality: number,
        interval: number
    ): Chord {
        return { rootNote: notes[rootNote], quality, interval };
    }

    /** Detects a single chord from a single audio frame
      @param audioBuffer Buffer than contains the sound data
    */
    public detectChord(audioBuffer: AudioBuffer): Chord {
        const chroma_builder = new Chromagram(
            audioBuffer.length,
            audioBuffer.sampleRate
        );
        chroma_builder.processAudioFrame(audioBuffer.getChannelData(0));
        chroma_builder.setChromaCalculationInterval(audioBuffer.length);
        const detector = new ChordDetector();
        if (chroma_builder.isReady()) {
            detector.detectChord(chroma_builder.getChromagram());
            return this.prettifyChord(
                detector.rootNote,
                detector.quality,
                detector.intervals
            );
        } else {
            return { rootNote: RootNotes.NC, quality: -1, interval: -1 };
        }
    }

    /** Detects a chord based on continous audio data.
      @param audioBuffer Buffer than contains the sound data
    */
    public detectChords(audioBuffer: AudioBuffer): Chord[] {
        let buffer = audioBuffer.getChannelData(0);
        let frame = new Float32Array(this.frameSize);
        let chords = [];
        for (let i = 0; i < audioBuffer.length; i = i + this.frameSize) {
            for (let k = 0; k < this.frameSize; k++) {
                frame[k] = buffer[i + k];
            }
            this.chroma_builder.processAudioFrame(frame);
            if (this.chroma_builder.isReady()) {
                this.detector.detectChord(this.chroma_builder.getChromagram());
                chords.push(
                    this.prettifyChord(
                        this.detector.rootNote,
                        this.detector.quality,
                        this.detector.intervals
                    )
                );
            }
        }
        return chords;
    }
}
