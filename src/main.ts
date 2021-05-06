import { Chromagram } from "./Chromagram";
import { ChordDetector } from "./ChordDetector";

type Chord = { rootNote: number; quality: number; interval: number };

export default class Akkorder {
    private detector: ChordDetector;
    private chroma_builder: Chromagram;

    constructor(frameSize: number, sampleRate: number) {
        this.chroma_builder = new Chromagram(frameSize, sampleRate);
        this.detector = new ChordDetector();
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
            return {
                rootNote: detector.rootNote,
                quality: detector.quality,
                interval: detector.intervals,
            };
        } else {
            return { rootNote: -1, quality: -1, interval: -1 };
        }
    }

    /** Detects a chord based on continous audio data.
      @param audioBuffer Buffer than contains the sound data
    */
    public detectNextChord(audioBuffer: AudioBuffer): Chord | null {
        this.chroma_builder.processAudioFrame(audioBuffer.getChannelData(0));
        if (!this.chroma_builder.isReady()) return null;
        this.detector.detectChord(this.chroma_builder.getChromagram());
        return {
            rootNote: this.detector.rootNote,
            quality: this.detector.quality,
            interval: this.detector.intervals,
        };
    }
}
