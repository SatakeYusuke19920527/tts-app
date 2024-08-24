'use client';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { useState } from 'react';
import { getTokenOrRefresh } from '../util/token_util';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState("");
  const [player, updatePlayer] = useState({ p: undefined, muted: false });

  async function sttFromMic() {
    setIsLoading(true);
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

    await recognizer.recognizeOnceAsync((result: any) => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        setDisplayText(`RECOGNIZED: Text=${result.text}`);
        getAzData(result.text);
      } else {
        setDisplayText(
          'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.'
        );
      }
    });
    setIsLoading(false);
  }

  const getAzData = async (message: string) => {
    setIsLoading(true);
    try {
      console.log('start message : ', message);
      // const url = '/api/azopenai';

      const response = await fetch(`http://localhost:3000/api/azopenai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      console.log('🚀 ~ getAzData ~ response:', response);
      const { aiMessage } = await response.json();  
      console.log('🚀 ~ getAzData ~ res:', aiMessage);
      // 回答を音声で読み上げ
      // textToSpeech(aiMessage);
    } catch (err) {
      console.log('🚀 ~ file: index.tsx:32 ~ getAzData ~ err:', err);
    }
    setIsLoading(false);
  };

  const textToSpeech = async(answer: string) => {
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

    const textToSpeak = answer;
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
      <h1 className="display-4 mb-3">Speech talk with AI</h1>
      <div className="row main-container">
        <div className="col-6">
          <i className="cursor-pointer" onClick={() => sttFromMic()}>
            AOAIと話す
          </i>
        </div>
        <div className="col-6 output-display rounded">
          <code>{displayText}</code>
        </div>
      </div>
    </div>
  );
}
