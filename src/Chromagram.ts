//=======================================================================
/** @file Chromagram.h
 *  @brief Chromagram - a class for calculating the chromagram in real-time
 *  @author Adam Stark
 *  @copyright Copyright (C) 2008-2014  Queen Mary University of London
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
//=======================================================================
import FFT from "fft.js";

//=======================================================================
/** A class for calculating a Chromagram from input audio
 * in a real-time context */
export class Chromagram {
    private window: number[];
    private buffer: number[];
    private magnitudeSpectrum: number[];
    private downsampledInputAudioFrame: number[];
    private chromagram: number[];

    private referenceFrequency: number;
    private noteFrequencies: number[];

    private bufferSize: number = 0;
    private samplingFrequency: number = 0;
    private inputAudioFrameSize: number = 0;
    private downSampledAudioFrameSize: number = 0;
    private numHarmonics: number;
    private numOctaves: number;
    private numBinsToSearch: number;
    private numSamplesSinceLastCalculation: number;
    private chromaCalculationInterval: number;
    private chromaReady: boolean;
    private complexIn: any[];
    private complexOut: any[];
    private fft: any;

    /** Constructor
     * @param frameSize the input audio frame size
     * @param fs the sampling frequency
     */
    public constructor(frameSize: number, fs: number) {
        this.referenceFrequency = 130.81278265;
        this.bufferSize = 8192;
        this.numHarmonics = 2;
        this.numOctaves = 2;
        this.numBinsToSearch = 2;
        this.noteFrequencies = new Array(12);
        this.buffer = [];
        this.window = [];
        this.buffer = [];
        this.magnitudeSpectrum = [];
        this.downsampledInputAudioFrame = [];
        this.chromagram = [];
        this.noteFrequencies = [];
        this.complexIn = [];
        this.complexOut = [];

        // calculate note frequencies
        for (let i = 0; i < 12; i++) {
            this.noteFrequencies[i] =
                this.referenceFrequency * Math.pow(2, i / 12);
        }

        // set up FFT
        this.setupFFT();

        // set buffer size
        for (let i = 0; i < this.bufferSize; i++) this.buffer.push(0);

        // setup chromagram vector
        for (let i = 0; i < 12; i++) this.chromagram.push(0.0);

        // setup magnitude spectrum vector
        // setup chromagram vector
        for (let i = 0; i < this.bufferSize / 2 + 1; i++)
            this.magnitudeSpectrum.push(0);

        // make window function
        this.makeHammingWindow();

        // set sampling frequency
        this.setSamplingFrequency(fs);

        // set input audio frame size
        this.setInputAudioFrameSize(frameSize);

        // initialise num samples counter
        this.numSamplesSinceLastCalculation = 0;

        // set chroma calculation interval (in samples at the input audio sampling frequency)
        this.chromaCalculationInterval = 4096;

        // initialise chroma ready variable
        this.chromaReady = false;
    }

    /** Process a single audio frame. This will determine whether enough samples
     * have been accumulated and if so, will calculate the chromagram
     * @param inputAudioFrame an array containing the input audio frame. This should be
     * the length indicated by the input audio frame size passed to the constructor
     * @see setInputAudioFrameSize
     */
    public processAudioFrame(inputAudioFrame: Float64Array | Float32Array) {
        // process the vector
        // our default state is that the chroma is not ready
        this.chromaReady = false;

        // downsample the input audio frame by 4
        this.downSampleFrame(inputAudioFrame);

        // move samples back
        for (
            let i = 0;
            i < this.bufferSize - this.downSampledAudioFrameSize;
            i++
        ) {
            this.buffer[i] = this.buffer[i + this.downSampledAudioFrameSize];
        }

        let n = 0;

        // add new samples to buffer
        for (
            let i = this.bufferSize - this.downSampledAudioFrameSize;
            i < this.bufferSize;
            i++
        ) {
            this.buffer[i] = this.downsampledInputAudioFrame[n];
            n++;
        }

        // add number of samples from calculation
        this.numSamplesSinceLastCalculation += this.inputAudioFrameSize;

        // if we have had enough samples
        if (
            this.numSamplesSinceLastCalculation >=
            this.chromaCalculationInterval
        ) {
            // calculate the chromagram
            this.calculateChromagram();

            // reset num samples counter
            this.numSamplesSinceLastCalculation = 0;
        }
    }
    /** Sets the input audio frame size
     * @param frameSize the input audio frame size
     */
    setInputAudioFrameSize(frameSize: number) {
        this.inputAudioFrameSize = frameSize;
        let arr = [];
        for (let i = 0; i < this.inputAudioFrameSize / 4; i++) arr.push(0);
        this.downsampledInputAudioFrame = arr;
        this.downSampledAudioFrameSize = this.downsampledInputAudioFrame.length;
    }

    /** Set the sampling frequency of the input audio
     * @param fs the sampling frequency in Hz
     */
    setSamplingFrequency(fs: number) {
        this.samplingFrequency = fs;
    }

    /** Set the interval at which the chromagram is calculated. As the algorithm requires
     * a significant amount of audio to be accumulated, it may be desirable to have the algorithm
     * not calculate the chromagram at every new audio frame. This function allows you to set the
     * interval at which the chromagram will be calculated, specified in the number of samples at
     * the audio sampling frequency
     * @param numSamples the number of samples that the algorithm will receive before calculating a new chromagram
     */
    setChromaCalculationInterval(numSamples: number) {
        this.chromaCalculationInterval = numSamples;
    }

    /** @returns the chromagram vector */
    getChromagram(): number[] {
        return this.chromagram;
    }

    /** @returns true if a new chromagram vector has been calculated at the current iteration. This should
     * be called after processAudioFrame
     */
    public isReady(): boolean {
        return this.chromaReady;
    }

    private setupFFT() {
        this.fft = new FFT(this.bufferSize);
        this.complexIn = this.fft.createComplexArray();
        this.complexOut = this.fft.createComplexArray();
    }

    private calculateChromagram() {
        this.calculateMagnitudeSpectrum();

        let divisorRatio = this.samplingFrequency / 4.0 / this.bufferSize;

        for (let n = 0; n < 12; n++) {
            let chromaSum = 0.0;

            for (let octave = 1; octave <= this.numOctaves; octave++) {
                let noteSum = 0.0;

                for (
                    let harmonic = 1;
                    harmonic <= this.numHarmonics;
                    harmonic++
                ) {
                    let centerBin = this.round(
                        (this.noteFrequencies[n] * octave * harmonic) /
                            divisorRatio
                    );
                    let minBin = centerBin - this.numBinsToSearch * harmonic;
                    let maxBin = centerBin + this.numBinsToSearch * harmonic;

                    let maxVal = 0.0;

                    for (let k = minBin; k < maxBin; k++) {
                        if (this.magnitudeSpectrum[k] > maxVal) {
                            maxVal = this.magnitudeSpectrum[k];
                        }
                    }

                    noteSum += maxVal / harmonic;
                }

                chromaSum += noteSum;
            }

            this.chromagram[n] = chromaSum;
        }
        this.chromaReady = true;
    }

    //Potential source of bugs
    private calculateMagnitudeSpectrum() {
        for (let i = 0; i < this.bufferSize; i += 2) {
            this.complexIn[i * 2] = this.buffer[i] * this.window[i];
            this.complexIn[i * 2 + 1] = 0.0;
        }

        // execute fft transform
        this.fft.transform(this.complexOut, this.complexIn);

        // compute fresizeirst (N/2)+1 mag values
        for (let i = 0; i < this.bufferSize / 2 + 1; i += 1) {
            this.magnitudeSpectrum[i] = Math.sqrt(
                Math.pow(this.complexOut[i * 2], 2) +
                    Math.pow(this.complexOut[i * 2 + 1], 2)
            );
            this.magnitudeSpectrum[i] = Math.sqrt(this.magnitudeSpectrum[i]);
        }
    }

    private downSampleFrame(inputAudioFrame: Float64Array | Float32Array) {
        let filteredFrame: number[] = new Array(this.inputAudioFrameSize);
        let b0, b1, b2, a1, a2;
        let x_1, x_2, y_1, y_2;

        b0 = 0.2929;
        b1 = 0.5858;
        b2 = 0.2929;
        a1 = -0.0;
        a2 = 0.1716;

        x_1 = 0;
        x_2 = 0;
        y_1 = 0;
        y_2 = 0;

        for (let i = 0; i < this.inputAudioFrameSize; i++) {
            filteredFrame[i] =
                inputAudioFrame[i] * b0 +
                x_1 * b1 +
                x_2 * b2 -
                y_1 * a1 -
                y_2 * a2;
            x_2 = x_1;
            x_1 = inputAudioFrame[i];
            y_2 = y_1;
            y_1 = filteredFrame[i];
        }

        for (let i = 0; i < this.inputAudioFrameSize / 4; i++) {
            this.downsampledInputAudioFrame[i] = filteredFrame[i * 4];
        }
    }

    private makeHammingWindow() {
        // set the window to the correct size
        this.window = new Array(this.bufferSize);

        // apply hanning window to buffer
        for (let n = 0; n < this.bufferSize; n++) {
            this.window[n] =
                0.54 - 0.46 * Math.cos(2 * Math.PI * (n / this.bufferSize));
        }
    }

    private round(val: number): number {
        return Math.floor(val + 0.5);
    }
}
