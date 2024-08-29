'use client';

import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { inputMessageToReduxStore } from '../../features/messageSlice';
import { useAppDispatch } from '../../hooks/useRTK';
import { getTokenOrRefresh } from '../../util/token_util';
const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

const FormInput = () => {
  // const [message, setMessage] = useState('');
  // const [isLoading, setIsLoading] = useState(false);

  // const sendMessage = async () => {
  //   setIsLoading(true);
  //   // Send human message to the redux store
  //   dispatch(
  //     inputMessageToReduxStore({
  //       pathname,
  //       message,
  //       isMan: true,
  //     })
  //   );

  //   // Send message to the OpenAI
  //   const url =
  //     pathname === '/'
  //       ? '/api/onyourdata'
  //       : pathname === '/rag-extra-1'
  //       ? '/api/rag-extra-1'
  //       : pathname === '/rag-extra-2'
  //       ? '/api/rag-extra-2'
  //       : '/api/onyourdata';
  //   const response = await fetch(`${process.env.NEXT_PUBLIC_URL}${url}`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ message }),
  //   });

  //   const { aiMessage } = await response.json();
  //   // Send OpenAI message to the redux store
  //   setMessage('');
  //   setIsLoading(false);
  // };
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState('');
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
          dispatch(
            inputMessageToReduxStore({
              pathname,
              message: result.text,
              isMan: true,
            })
          );
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

  const textToSpeech = async (answer: string) => {
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
        setDisplayAIText('AI : ' + text!);
        dispatch(
          inputMessageToReduxStore({
            pathname,
            message: text,
            isMan: false,
          })
        );
      },
      function (err: any) {
        setDisplayAIText(`Error: ${err}.\n`);
        dispatch(
          inputMessageToReduxStore({
            pathname,
            message: err,
            isMan: false,
          })
        );

        synthesizer.close();
        synthesizer = undefined;
      }
    );
  };

  return (
    <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50">
      <div className="flex main-container">
        <div className="col-6">
          <button
            type="button"
            onClick={() => sttFromMic()}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            {isLoading ? (
              <div className="flex justify-center" aria-label="読み込み中">
                <div className="animate-spin h-8 w-8 bg-blue-300 rounded-xl"></div>
              </div>
            ) : (
              <>talk to AI</>
            )}
          </button>
        </div>
        {/* <div className="p-4 col-6 output-display rounded">
          <div className="mb-5 text-gray-500">{displayText}</div>
          <div className="mb-5 text-gray-500">{displayAIText}</div>
        </div> */}
      </div>
    </div>
  );
};

export default FormInput;
