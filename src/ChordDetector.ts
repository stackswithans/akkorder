//=======================================================================
/** @file ChordDetector.h
 *  @brief ChordDetector - a class for estimating chord labels from this.chromagram input
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
//=======================================================================
/** An enum describing the chord qualities used in the algorithm */
export enum ChordQuality {
    Minor,
    Major,
    Suspended,
    Dominant,
    Dimished5th,
    Augmented5th,
}
/** A class for estimating chord labels from this.chromagram input */
export class ChordDetector {
    /** The root note of the detected chord */
    public rootNote: number = 0;
    /** The quality of the detected chord (Major, Minor, etc) */
    public quality: number = 0;
    /** Any other intervals that describe the chord, e.g. 7th */
    public intervals: number = 0;

    private chromagram: number[];
    private chordProfiles: number[][];
    private chord: number[];
    private bias: number;
    private makeMatrix(rows: number, cols: number): number[][] {
        let arr = new Array();
        for (let i = 0; i < rows; i++) {
            arr.push(new Array(cols));
        }
        return arr;
    }
    /** Constructor */
    public constructor() {
        this.chordProfiles = this.makeMatrix(108, 12);
        this.chromagram = new Array(12);
        this.chord = new Array(108);
        this.bias = 1.06;
        this.makeChordProfiles();
    }

    /** Detects the chord from a this.chromagram. This is the vector interface
     * @param chroma a vector of length 12 containing the this.chromagram
     */
    public detectChord(chroma: number[]) {
        for (let i = 0; i < 12; i++) {
            this.chromagram[i] = chroma[i];
        }
        this.classifyChromagram();
    }

    public makeChordProfiles() {
        let i;
        let t;
        let j = 0;
        let root;
        let third;
        let fifth;
        let seventh;

        let v1 = 1;
        let v2 = 1;
        let v3 = 1;

        // set profiles matrix to all zeros
        for (j = 0; j < 108; j++) {
            for (t = 0; t < 12; t++) {
                this.chordProfiles[j][t] = 0;
            }
        }

        // reset j to zero to begin creating profiles
        j = 0;

        // major chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 4) % 12;
            fifth = (i + 7) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;

            j++;
        }

        // minor chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 3) % 12;
            fifth = (i + 7) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;

            j++;
        }

        // diminished chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 3) % 12;
            fifth = (i + 6) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;

            j++;
        }

        // augmented chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 4) % 12;
            fifth = (i + 8) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;

            j++;
        }

        // sus2 chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 2) % 12;
            fifth = (i + 7) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;

            j++;
        }

        // sus4 chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 5) % 12;
            fifth = (i + 7) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;

            j++;
        }

        // major 7th chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 4) % 12;
            fifth = (i + 7) % 12;
            seventh = (i + 11) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;
            this.chordProfiles[j][seventh] = v3;

            j++;
        }

        // minor 7th chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 3) % 12;
            fifth = (i + 7) % 12;
            seventh = (i + 10) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;
            this.chordProfiles[j][seventh] = v3;

            j++;
        }

        // dominant 7th chords
        for (i = 0; i < 12; i++) {
            root = i % 12;
            third = (i + 4) % 12;
            fifth = (i + 7) % 12;
            seventh = (i + 10) % 12;

            this.chordProfiles[j][root] = v1;
            this.chordProfiles[j][third] = v2;
            this.chordProfiles[j][fifth] = v3;
            this.chordProfiles[j][seventh] = v3;

            j++;
        }
    }

    public classifyChromagram() {
        let i: number;
        let j: number;
        let fifth: number;
        let chordindex: number;

        // remove some of the 5th note energy from this.chromagram
        for (i = 0; i < 12; i++) {
            fifth = (i + 7) % 12;
            this.chromagram[fifth] =
                this.chromagram[fifth] - 0.1 * this.chromagram[i];
            if (this.chromagram[fifth] < 0) {
                this.chromagram[fifth] = 0;
            }
        }

        // major chords
        for (j = 0; j < 12; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                this.bias,
                3
            );
        }

        // minor chords
        for (j = 12; j < 24; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                this.bias,
                3
            );
        }

        // diminished 5th chords
        for (j = 24; j < 36; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                this.bias,
                3
            );
        }

        // augmented 5th chords
        for (j = 36; j < 48; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                this.bias,
                3
            );
        }

        // sus2 chords
        for (j = 48; j < 60; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                1,
                3
            );
        }

        // sus4 chords
        for (j = 60; j < 72; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                1,
                3
            );
        }

        // major 7th chords
        for (j = 72; j < 84; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                1,
                4
            );
        }

        // minor 7th chords
        for (j = 84; j < 96; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                this.bias,
                4
            );
        }

        // dominant 7th chords
        for (j = 96; j < 108; j++) {
            this.chord[j] = this.calculateChordScore(
                this.chromagram,
                this.chordProfiles[j],
                this.bias,
                4
            );
        }

        chordindex = this.minimumIndex(this.chord, 108);

        // major
        if (chordindex < 12) {
            this.rootNote = chordindex;
            this.quality = ChordQuality.Major;
            this.intervals = 0;
        }

        // minor
        if (chordindex >= 12 && chordindex < 24) {
            this.rootNote = chordindex - 12;
            this.quality = ChordQuality.Minor;
            this.intervals = 0;
        }

        // diminished 5th
        if (chordindex >= 24 && chordindex < 36) {
            this.rootNote = chordindex - 24;
            this.quality = ChordQuality.Dimished5th;
            this.intervals = 0;
        }

        // augmented 5th
        if (chordindex >= 36 && chordindex < 48) {
            this.rootNote = chordindex - 36;
            this.quality = ChordQuality.Augmented5th;
            this.intervals = 0;
        }

        // sus2
        if (chordindex >= 48 && chordindex < 60) {
            this.rootNote = chordindex - 48;
            this.quality = ChordQuality.Suspended;
            this.intervals = 2;
        }

        // sus4
        if (chordindex >= 60 && chordindex < 72) {
            this.rootNote = chordindex - 60;
            this.quality = ChordQuality.Suspended;
            this.intervals = 4;
        }

        // major 7th
        if (chordindex >= 72 && chordindex < 84) {
            this.rootNote = chordindex - 72;
            this.quality = ChordQuality.Major;
            this.intervals = 7;
        }

        // minor 7th
        if (chordindex >= 84 && chordindex < 96) {
            this.rootNote = chordindex - 84;
            this.quality = ChordQuality.Minor;
            this.intervals = 7;
        }

        // dominant 7th
        if (chordindex >= 96 && chordindex < 108) {
            this.rootNote = chordindex - 96;
            this.quality = ChordQuality.Dominant;
            this.intervals = 7;
        }
    }

    public calculateChordScore(
        chroma: number[],
        chordProfile: number[],
        biasToUse: number,
        N: number
    ): number {
        let sum: number = 0;
        let delta: number;

        for (let i = 0; i < 12; i++) {
            sum = sum + (1 - chordProfile[i]) * (chroma[i] * chroma[i]);
        }

        delta = Math.sqrt(sum) / ((12 - N) * biasToUse);
        return delta;
    }

    public minimumIndex(array: number[], arrayLength: number): number {
        let minValue = 100000;
        let minIndex = 0;
        for (let i = 0; i < arrayLength; i++) {
            if (array[i] < minValue) {
                minValue = array[i];
                minIndex = i;
            }
        }

        return minIndex;
    }
}
