---
base_model: microsoft/speecht5_tts
library_name: transformers.js
pipeline_tag: text-to-speech
---

https://huggingface.co/microsoft/speecht5_tts with ONNX weights to be compatible with Transformers.js.


## Usage (Transformers.js)

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

**Example:** Text-to-speech pipeline.
```js
import { pipeline } from '@huggingface/transformers';

// Create a text-to-speech pipeline
const synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { dtype: 'fp32' });  // Options: "fp32", "fp16", "q8", "q4"

// Generate speech
const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
const result = await synthesizer('Hello, my dog is cute', { speaker_embeddings });
console.log(result);
// {
//   audio: Float32Array(26112) [-0.00005657337896991521, 0.00020583874720614403, ...],
//   sampling_rate: 16000
// }
```

Optionally, save the audio to a wav file (Node.js):
```js
import wavefile from 'wavefile';
import fs from 'fs';

const wav = new wavefile.WaveFile();
wav.fromScratch(1, result.sampling_rate, '32f', result.audio);
fs.writeFileSync('result.wav', wav.toBuffer());
```

<audio controls src="https://cdn-uploads.huggingface.co/production/uploads/61b253b7ac5ecaae3d1efe0c/on1ij9Y269ne9zlYN9mdb.wav"></audio>

**Example:** Load processor, tokenizer, and models separately.
```js
import { AutoTokenizer, AutoProcessor, SpeechT5ForTextToSpeech, SpeechT5HifiGan, Tensor } from '@huggingface/transformers';

// Load the tokenizer and processor
const tokenizer = await AutoTokenizer.from_pretrained('Xenova/speecht5_tts');
const processor = await AutoProcessor.from_pretrained('Xenova/speecht5_tts');

// Load the models
// NOTE: We use the unquantized versions as they are more accurate
const model = await SpeechT5ForTextToSpeech.from_pretrained('Xenova/speecht5_tts', { dtype: 'fp32' });  // Options: "fp32", "fp16", "q8", "q4"
const vocoder = await SpeechT5HifiGan.from_pretrained('Xenova/speecht5_hifigan', { dtype: 'fp32' });  // Options: "fp32", "fp16", "q8", "q4"

// Load speaker embeddings from URL
const speaker_embeddings_data = new Float32Array(
    await (await fetch('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin')).arrayBuffer()
);
const speaker_embeddings = new Tensor(
    'float32',
    speaker_embeddings_data,
    [1, speaker_embeddings_data.length]
)

// Run tokenization
const { input_ids } = tokenizer('Hello, my dog is cute');

// Generate waveform
const { waveform } = await model.generate_speech(input_ids, speaker_embeddings, { vocoder });
console.log(waveform)
// Tensor {
//   dims: [ 26112 ],
//   type: 'float32',
//   size: 26112,
//   data: Float32Array(26112) [ -0.00043630177970044315, -0.00018082228780258447, ... ],
// }
```

Optionally, save the audio to a wav file (Node.js):
```js
// Write to file (Node.js)
import wavefile from 'wavefile';
import fs from 'fs';

const wav = new wavefile.WaveFile();
wav.fromScratch(1, processor.feature_extractor.config.sampling_rate, '32f', waveform.data);
fs.writeFileSync('out.wav', wav.toBuffer());
```


---

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).