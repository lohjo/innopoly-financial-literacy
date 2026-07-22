class PcmRecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel) this.port.postMessage(new Float32Array(channel));
    return true;
  }
}

registerProcessor("finfy-pcm-recorder", PcmRecorderProcessor);
