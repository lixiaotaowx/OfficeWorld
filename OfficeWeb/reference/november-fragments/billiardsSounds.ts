        tone.onended=()=>{tone.disconnect();gain.disconnect();};tone.start(now);tone.stop(now+length+.01);\
        if(event.kind!=='pocket'){\
          const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.025),context.sampleRate),samples=buffer.getChannelData(0);\
          for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.pow(1-i/samples.length,4);\
          const noise=context.createBufferSource(),noiseGain=context.createGain();noise.buffer=buffer;noiseGain.gain.value=.02+.04*event.strength;\
          noise.connect(noiseGain);noiseGain.connect(context.destination);noise.onended=()=>{noise.disconnect();noiseGain.disconnect();};noise.start(now);\
        }\
