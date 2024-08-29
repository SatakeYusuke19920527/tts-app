import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export const POST = async (req: NextRequest) => {
  try {
    const { message } = await req.json();

    const aiMessage = await returnAiMessage(message);
    console.log("🚀 ~ POST ~ aiMessage:", aiMessage)

    return NextResponse.json({ aiMessage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ aiMessage: error.message }, { status: 500 });
  }
};

const returnAiMessage = (message: any) => {
  return new Promise(async (resolve, reject) => {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID!;
    const content = `
      ${message}
      `;
    try {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content,
        },
      ];
      const client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(azureApiKey)
      );

      const result = await client.getChatCompletions(deploymentId, messages);
      console.log("🚀 ~ answer ~ result:", result.choices)
      resolve(result.choices);
    } catch (error: any) {
      console.log(
        '🚀 ~ file: openaiRepository.ts:29 ~ AzOpenaiRepository ~ returnnewPromise ~ error:',
        error
      );
      reject(error);
    }
  });
}

export const dynamic = 'force-dynamic';
