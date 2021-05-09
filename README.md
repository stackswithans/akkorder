# Akkorder

Akkorder is a Typescript port of the C++ implementation of the chord recognition algorithm first described in the conference paper:
* "Real-Time Chord Recognition For Live Performance", A. M. Stark and M. D. Plumbley. In Proceedings of the 2009 International Computer Music Conference (ICMC 2009), Montreal, Canada, 16-21 August 2009."

And expanded upon in Adam Stark's PhD Thesis:

* "Musicians and Machines: Bridging the Semantic Gap in Live Performance", A. M. Stark, PhD Thesis, Queen Mary, University of London, 2011.

The original implementation can be found [here](https://github.com/adamstark/Chord-Detector-and-Chromagram).

**Note**: This port is not meant to be efficient, i was just in need of a chord detection algorithm that could be used in the browser.

## Usage - Custom API 
The `detectChords` function is not a part of the original library, it was added to
to the port for my specific needs. The function performs the chord detection algorithm 
on the array containing the sound data.
The frame size will be equal to the sampling frequency.The number of chords returned 
will be approximately equal to the number of seconds in the audio track.
```typescript

import { detectChords } from "akkorder";

let audioBuffer = ...; //Get audio buffer from a source

let chords = detectChords(audioBuffer);
//Do something with chords
chords.map((chord) => {
    console.log(chord);
});
```
## Usage - Original API 

These are the instructions ported from the original [repo](https://github.com/adamstark/Chord-Detector-and-Chromagram).
### Chromagram Estimation

*1 - Import the Chromagram class* 

```typescript
import { Chromagram } from "akkorder";
```
*2 - Instantiate the algorithm, specifying the audio frame size and sample rate:* 
```typescript
let frameSize = 512;
let sampleRate = 44100;

c = new Chromagram(frameSize,sampleRate); 
```

*3 - In the processing loop, fill an array with one frame of audio samples and process it:* 

```typescript
let frame = new Array(frameSize); 
// !
// do something here to fill the frame with audio samples
// !
//and then call:

c.processAudioFrame (frame);
```
*4 - Getting The Chromagram* 
```typescript
// The algorithm requires a fair bit of audio to calculate the chromagram, 
// so calculating it at every audio frame of (for example) 512 samples may be unnecessary (and take up lots of CPU cycles).
// After calling `processAudioFrame()` (see step 3), simply call:
if (c.isReady()){
    let chroma = c.getChromagram();
    // do something with the chromagram here
}
```

#### Setting Parameters
You can set a number of parameters for the algorithm. These include:
* The audio frame size:

``` typescript
c.setInputAudioFrameSize(512);
```

* The sampling frequency:
``` typescript
c.setSamplingFrequency(44100);
```

* The interval at which the chromagram is calculated (specified in audio samples at the sampling frequency that the algorithm has been initialised with - the default is 8192):
``` typescript
c.setChromaCalculationInterval(8192);
```


### Chord Detection

*1 - Import the ChordDetector class* 

```typescript
import { ChordDetector } from "akkorder";
```
*2 - Instantiate the ChordDetector:* 
```typescript
let chordDetector = new ChordDetector();
```

*3 - Fill an array of length 12 with chromagram values (perhaps estimated from audio, 
using the Chromagram class) and call the detectChord method of ChordDetector class:*
```typescript
let chroma = new Array(12);
// !
// fill with chromagram values here
// !

// Then call the detectChord method
chordDetector.detectChord (chroma);
```

*4 - You can then get the root note, chord quality (major, minor, etc) 
and any other intervals via:* 
```typescript
chordDetector.rootNote
chordDetector.quality
chordDetector.intervals
```

