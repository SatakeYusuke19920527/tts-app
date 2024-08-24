'use client';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { useState } from 'react';
import { getTokenOrRefresh } from '../util/token_util';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

export default function Home() {
  const [displayText, setDisplayText] = useState(
    'INITIALIZED: ready to test speech...'
  );
  const [player, updatePlayer] = useState({ p: undefined, muted: false });

  async function sttFromMic() {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = 'en-US';

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    setDisplayText('speak into your microphone...');

    recognizer.recognizeOnceAsync((result: any) => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        setDisplayText(`RECOGNIZED: Text=${result.text}`);
      } else {
        setDisplayText(
          'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.'
        );
      }
    });
  }
  const textToSpeech = async() => {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    const myPlayer = new speechsdk.SpeakerAudioDestination();
    updatePlayer((p) => {
      p.p = myPlayer;
      return p;
    });
    const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.p);

    let synthesizer = new speechsdk.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    const textToSpeak =
      'I am AI. How about you? I am doing great! Thank you so much. and you?';
    setDisplayText(`speaking text: ${textToSpeak}...`);
    synthesizer.speakTextAsync(
      textToSpeak,
      (result: any) => {
        let text;
        if (
          result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted
        ) {
          text = `synthesis finished for "${textToSpeak}".\n`;
        } else if (result.reason === speechsdk.ResultReason.Canceled) {
          text = `synthesis failed. Error detail: ${result.errorDetails}.\n`;
        }
        synthesizer.close();
        synthesizer = undefined;
        setDisplayText(text!);
      },
      function (err: any) {
        setDisplayText(`Error: ${err}.\n`);

        synthesizer.close();
        synthesizer = undefined;
      }
    );
  }
  
  return (
    <div className="app-container">
      <h1 className="display-4 mb-3">Speech sample app</h1>

      <div className="row main-container">
        <div className="col-6">
          <i className="cursor-pointer" onClick={() => sttFromMic()}>
            💡
          </i>
          <div className="mt-2">
            <i className="cursor-pointer" onClick={() => textToSpeech()}>
              🚀
            </i>
          </div>
        </div>
        <div className="col-6 output-display rounded">
          <code>{displayText}</code>
        </div>
      </div>
    </div>
  );
}
