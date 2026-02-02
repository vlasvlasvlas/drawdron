# 🎛️ DrawDron - Sound Creation Guide

Complete reference for creating custom drone textures.

---

## 📋 Texture JSON Structure

Every texture is a JSON object with the following structure:

```json
{
  "id": "my-texture",
  "name": "My Texture",
  "color": "#00FF88",
  "note": "C3",
  "growthSpeed": 1.0,
  "fadeTime": 15,
  "oscillator": { ... },
  "filter": { ... },
  "effects": { ... },
  "envelope": { ... },
  "lfo": { ... },
  "arpeggiator": { ... }
}
```

---

## 🎚️ Parameter Reference

### Basic Properties

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `id` | string | - | Unique identifier |
| `name` | string | - | Display name |
| `color` | string | Hex color | Branch color (e.g., `"#FF5500"`) |
| `note` | string | C1-C5 | Base note (e.g., `"C3"`, `"A2"`) |
| `growthSpeed` | number | 0.2 - 2.5 | Branch growth speed (lower = slower) |
| `fadeTime` | number | 3 - 40 | Seconds until complete fade |

---

### Oscillator

```json
"oscillator": {
  "type": "sawtooth",
  "detune": 8
}
```

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `type` | string | `sine`, `sawtooth`, `square`, `triangle` | Waveform shape |
| `detune` | number | 0 - 30 | Cents of detuning (creates thickness) |

**Waveform Characteristics:**
- `sine` — Pure, soft, ethereal
- `sawtooth` — Rich harmonics, buzzy, classic synth
- `square` — Hollow, nasal, 8-bit feel
- `triangle` — Soft but with some edge

---

### Filter

```json
"filter": {
  "type": "lowpass",
  "maxFreq": 8000,
  "Q": 1.5
}
```

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `type` | string | `lowpass`, `highpass`, `bandpass` | Filter type |
| `maxFreq` | number | 1000 - 12000 | Maximum filter frequency |
| `Q` | number | 0.1 - 15 | Resonance (higher = more pronounced) |

**Filter Types:**
- `lowpass` — Removes highs, warm/dark
- `highpass` — Removes lows, thin/airy
- `bandpass` — Removes both, focused/nasal

---

### Envelope

```json
"envelope": {
  "attack": 2.0,
  "release": 6.0
}
```

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `attack` | number | 0.01 - 8.0 | Seconds to reach full volume |
| `release` | number | 0.1 - 30.0 | Seconds to fade after trigger |

---

### Effects Chain

Effects are applied in order: **Tremolo → Distortion → Delay → Reverb → Chorus**

```json
"effects": {
  "tremolo": 0.5,
  "tremoloRate": 4,
  "distortion": 0.1,
  "delay": 0.4,
  "delayTime": "8n",
  "delayFeedback": 0.5,
  "reverb": 0.6,
  "reverbDecay": 5,
  "chorus": 0.3
}
```

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `tremolo` | number | 0 - 1 | Tremolo depth (amplitude wobble) |
| `tremoloRate` | number | 0.5 - 20 | Tremolo speed in Hz |
| `distortion` | number | 0 - 1 | Distortion amount |
| `delay` | number | 0 - 1 | Delay wet/dry mix |
| `delayTime` | string | `"4n"`, `"8n"`, `"16n"` | Delay time (musical notation) |
| `delayFeedback` | number | 0 - 0.9 | Delay repeats |
| `reverb` | number | 0 - 1 | Reverb wet/dry mix |
| `reverbDecay` | number | 1 - 10 | Reverb tail length |
| `chorus` | number | 0 - 1 | Chorus depth (stereo width) |

---

### LFO (Low Frequency Oscillator)

Modulates the filter cutoff for movement.

```json
"lfo": {
  "rate": 0.5,
  "depth": 0.4
}
```

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `rate` | number | 0.1 - 10 | LFO speed in Hz |
| `depth` | number | 0 - 1 | Modulation depth |

---

### Arpeggiator

Turns the drone into a rhythmic sequence.

```json
"arpeggiator": {
  "enabled": true,
  "pattern": "upDown",
  "octaves": 2,
  "rate": "8n"
}
```

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `enabled` | boolean | `true`/`false` | Enable arpeggiator |
| `pattern` | string | `up`, `down`, `upDown`, `downUp`, `random` | Note sequence pattern |
| `octaves` | number | 1 - 4 | Number of octaves to span |
| `rate` | string | `"1n"`, `"2n"`, `"4n"`, `"8n"`, `"16n"`, `"32n"` | Note speed |

**Patterns:**
- `up` — Ascending notes ↑
- `down` — Descending notes ↓
- `upDown` — Up then down ↑↓
- `downUp` — Down then up ↓↑
- `random` — Random order ⚡

---

## 📌 Example Presets

### 1. Deep Bass Drone (Sunn O))) style)

```json
{
  "name": "Deep Hum",
  "color": "#00D9FF",
  "note": "C2",
  "growthSpeed": 0.6,
  "fadeTime": 18,
  "oscillator": { "type": "sawtooth", "detune": 8 },
  "filter": { "type": "lowpass", "maxFreq": 4000, "Q": 1.5 },
  "effects": {
    "reverb": 0.6,
    "delay": 0.15,
    "distortion": 0.05,
    "chorus": 0.2
  },
  "envelope": { "attack": 2.5, "release": 6 }
}
```

---

### 2. Ethereal Shimmer (Stars of the Lid style)

```json
{
  "name": "Shimmer",
  "color": "#A855F7",
  "note": "E4",
  "growthSpeed": 1.4,
  "fadeTime": 12,
  "oscillator": { "type": "sine", "detune": 12 },
  "filter": { "type": "lowpass", "maxFreq": 12000, "Q": 0.5 },
  "effects": {
    "reverb": 0.85,
    "delay": 0.5,
    "tremolo": 0.3,
    "tremoloRate": 3,
    "chorus": 0.6
  },
  "envelope": { "attack": 0.8, "release": 10 },
  "lfo": { "rate": 0.3, "depth": 0.4 }
}
```

---

### 3. Industrial Pulse (Tim Hecker style)

```json
{
  "name": "Pulse",
  "color": "#EF4444",
  "note": "A2",
  "growthSpeed": 0.4,
  "fadeTime": 22,
  "oscillator": { "type": "square", "detune": 0 },
  "filter": { "type": "bandpass", "maxFreq": 3000, "Q": 6 },
  "effects": {
    "reverb": 0.35,
    "delay": 0.6,
    "tremolo": 0.7,
    "tremoloRate": 6,
    "distortion": 0.25
  },
  "envelope": { "attack": 0.2, "release": 4 },
  "lfo": { "rate": 2.5, "depth": 0.6 }
}
```

---

### 4. Ambient Arpeggiated

```json
{
  "name": "Ambient Arp",
  "color": "#10B981",
  "note": "C3",
  "growthSpeed": 1.0,
  "fadeTime": 15,
  "oscillator": { "type": "triangle", "detune": 5 },
  "filter": { "type": "lowpass", "maxFreq": 6000, "Q": 1 },
  "effects": {
    "reverb": 0.7,
    "delay": 0.4,
    "chorus": 0.4
  },
  "envelope": { "attack": 0.1, "release": 8 },
  "arpeggiator": {
    "enabled": true,
    "pattern": "upDown",
    "octaves": 2,
    "rate": "8n"
  }
}
```

---

### 5. Glitchy Random

```json
{
  "name": "Glitch",
  "color": "#F59E0B",
  "note": "G3",
  "growthSpeed": 1.8,
  "fadeTime": 8,
  "oscillator": { "type": "square", "detune": 15 },
  "filter": { "type": "bandpass", "maxFreq": 5000, "Q": 8 },
  "effects": {
    "distortion": 0.4,
    "delay": 0.7,
    "delayFeedback": 0.6,
    "reverb": 0.3
  },
  "envelope": { "attack": 0.05, "release": 3 },
  "arpeggiator": {
    "enabled": true,
    "pattern": "random",
    "octaves": 3,
    "rate": "16n"
  }
}
```

---

## 📤 How to Add Custom Textures

### Method 1: Using the Editor
1. Click `+` button
2. Adjust all parameters
3. Click **Save**

### Method 2: Import JSON File
1. Create a JSON file:
```json
{
  "textures": [
    { /* texture 1 */ },
    { /* texture 2 */ }
  ]
}
```
2. Click **Import JSON** in editor
3. Select your file

### Method 3: Edit Default File
Edit `data/textures.json` directly, then refresh the page.

> **Tip**: Clear localStorage to reload defaults:
> ```javascript
> localStorage.removeItem('drawdron-textures');
> location.reload();
> ```

---

## ⚡ Tips for Good Sounds

1. **Start simple** — Begin with sine wave and add complexity
2. **Detune creates thickness** — 5-10 cents gives analog feel
3. **Use lowpass filter** — Safest for warm drones
4. **Long attack** — Classic drone feel (2-5 seconds)
5. **Reverb + Delay** — Creates space and movement
6. **LFO on filter** — Adds organic movement
7. **Match growthSpeed to fadeTime** — Shorter sounds grow faster

---

## 🎵 Musical Note Reference

| Note | Frequency | Character |
|------|-----------|-----------|
| C1 | 32 Hz | Very deep sub-bass |
| C2 | 65 Hz | Deep bass |
| A2 | 110 Hz | Low bass |
| C3 | 130 Hz | Bass |
| E3 | 165 Hz | Low mid |
| G3 | 196 Hz | Mid |
| C4 | 261 Hz | Middle C |
| E4 | 329 Hz | High mid |
| G4 | 392 Hz | High |
| C5 | 523 Hz | Bright |

---

## 📚 Further Reading

- [Tone.js Documentation](https://tonejs.github.io/docs/)
- [Paper.js Reference](http://paperjs.org/reference/)
- [L-Systems Explained](https://en.wikipedia.org/wiki/L-system)
