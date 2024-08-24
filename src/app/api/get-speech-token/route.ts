import axios from 'axios';
import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export const GET = async (res:NextResponse,req: NextRequest) => {  
  try {
        const speechKey = process.env.SPEECH_KEY;
        console.log("🚀 ~ GET ~ speechKey:", speechKey)
        const speechRegion = process.env.SPEECH_REGION;
        
        const headers = {
          headers: {
            'Ocp-Apim-Subscription-Key': speechKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };

      try {
        const tokenResponse = await axios.post(
          `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
          null,
          headers
        );
        // res.send({ token: tokenResponse.data, region: speechRegion });
        return NextResponse.json(
          {token: tokenResponse.data, region: speechRegion },
          { status: 200 }
        );
      } catch (err) {
        return NextResponse.json(
          { aiMessage: 'test message' },
          { status: 401 }
        );
      }
  } catch (error: any) {
    return NextResponse.json({ aiMessage: error.message }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
