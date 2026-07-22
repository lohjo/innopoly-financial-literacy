class PcmPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.samples = [];
    this.port.onmessage = ({ data }) => {
      const input = new Int16Array(data);
      for (let index = 0; index < input.length; index += 1) this.samples.push(input[index] / 32768);
    };
  }

  process(_inputs, outputs) {
    const output = outputs[0]?.[0];
    if (!output) return true;
    for (let index = 0; index < output.length; index += 1) output[index] = this.samples.shift() ?? 0;
    return true;
  }
}

registerProcessor("finfy-pcm-player", PcmPlayerProcessor);
