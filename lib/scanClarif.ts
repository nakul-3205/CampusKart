// /lib/scanClarif.ts
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';

const PAT = process.env.CLARIFAI_PAT || ''; // Add this in .env
const USER_ID = 'clarifai'; // usually 'clarifai'
const APP_ID = 'main'; // usually 'main'
const MODEL_ID = 'moderation-recognition'; // moderation model
const MODEL_VERSION_ID = ''; // optional

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set('authorization', 'Key ' + PAT);

export async function scanImageClarifai(imageUrl: string) {
  return new Promise((resolve, reject) => {
    stub.PostModelOutputs(
      {
        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID
        },
        model_id: MODEL_ID,
        version_id: MODEL_VERSION_ID,
        inputs: [
          {
            data: {
              image: {
                url: imageUrl,
                allow_duplicate_url: true
              }
            }
          }
        ]
      },
      metadata,
      (err, response) => {
        if (err) {
          console.error("Clarifai API error:", err);
          return reject(err);
        }

        if (response.status.code !== 10000) {
          console.error("Clarifai failed:", response.status.description);
          return reject(response.status.description);
        }

        const concepts = response.outputs[0].data.concepts;
        resolve(concepts);
      }
    );
  });
}
