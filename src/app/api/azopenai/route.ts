import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export const POST = async (req: NextRequest) => {
  try {
    const { message } = await req.json();
    console.log('🚀 ~ POST ~ message:', message);

    // 生成AIとの通信
    // const data = await getAzOpenAIData(message);

    // const response = await fetch(
    //   `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/{deployment-id}/completions?api-version=2023-03-15-preview`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'api-key': process.env.AZURE_OPENAI_API_KEY,
    //     },
    //     body: JSON.stringify({
    //       prompt: prompt,
    //       max_tokens: 100,
    //     }),
    //   }
    // );
    
    return NextResponse.json(
      { ans: 'test message' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ aiMessage: error.message }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
