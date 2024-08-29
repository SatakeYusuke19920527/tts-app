'use client';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { useState } from 'react';
import { getTokenOrRefresh } from '../util/token_util';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState("");
  const [displayAIText, setDisplayAIText] = useState('');
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
        setDisplayText(`You: ${result.text}`);
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
      console.log('🚀 ~ getAzData ~ aiMessage:', aiMessage[0].message.content);
      // 回答を音声で読み上げ
      textToSpeech(aiMessage[0].message.content);
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
    // setDisplayText();
    setDisplayAIText(`AI : ${textToSpeak}`);
    synthesizer.speakTextAsync(
      textToSpeak,
      (result: any) => {
        let text;
        if (
          result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted
        ) {
          text = `${textToSpeak} .\n`;
        } else if (result.reason === speechsdk.ResultReason.Canceled) {
          text = `synthesis failed. Error detail: ${result.errorDetails}.\n`;
        }
        synthesizer.close();
        synthesizer = undefined;
        setDisplayAIText("AI : " + text!);
      },
      function (err: any) {
        setDisplayAIText(`Error: ${err}.\n`);

        synthesizer.close();
        synthesizer = undefined;
      }
    );
  }
  
  return (
    <div className="app-container p-4">
      <h1 className="display-4 mb-5 text-4xl">Speech talk with AI</h1>
      <div className="row main-container">
        <div className="col-6">
          <button
            type="button"
            onClick={() => sttFromMic()}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            talk to AI
          </button>
        </div>
        <hr className="my-5" />
        <div className="p-4 col-6 output-display rounded">
          <div className="mb-5 text-gray-500">{displayText}</div>
          <div className="mb-5 text-gray-500">{displayAIText}</div>
        </div>
        {isLoading ? (
          <div className="flex justify-center" aria-label="読み込み中">
            <div className="animate-spin h-8 w-8 bg-blue-300 rounded-xl"></div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
