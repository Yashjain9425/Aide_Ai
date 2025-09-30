import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { cache } from "../config/cache.js";
import {GoogleGenAI} from '@google/genai';
import wav from 'wav';
import { PassThrough } from 'stream';

async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
){
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
          channels,
          sampleRate: rate,
          bitDepth: sampleWidth * 8,
    });

    writer.on('finish', resolve);
    writer.on('error', reject);

    writer.write(pcmData);
    writer.end();
 });
}

async function wrapPcmToWavBuffer(
  pcmBuffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });
    const out = new PassThrough();
    const chunks = [];
    out.on('data', (chunk) => chunks.push(chunk));
    out.on('end', () => resolve(Buffer.concat(chunks)));
    out.on('error', reject);

    writer.on('error', reject);

    writer.pipe(out);
    writer.end(pcmBuffer);
  });
}
const genAi = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });



const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;
    await cache.del("publishedCreations");
    await cache.del(`userCreations:${userId}`);
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;
    await cache.del("publishedCreations");
    await cache.del(`userCreations:${userId}`);
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateAudio = async (req, res) => {
  try {
    const { voice } = req.body;
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const response = await genAi.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }]}],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const data = inline?.data;
    if (!data) {
      return res.json({ success: false, message: 'Failed to generate audio' });
    }

    const mimeType = inline?.mimeType || 'audio/pcm';
    let dataUri;
    if (mimeType === 'audio/wav' || mimeType === 'audio/x-wav' || mimeType === 'audio/mpeg' || mimeType === 'audio/mp3' || mimeType === 'audio/ogg') {
      // Already a playable container
      dataUri = `data:${mimeType};base64,${data}`;
    } else {
      // Likely raw PCM, wrap into WAV so browsers can play it
      const pcmBuffer = Buffer.from(data, 'base64');
      const wavBuffer = await wrapPcmToWavBuffer(pcmBuffer, 1, 24000, 2);
      dataUri = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
    }

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${dataUri}, 'audio')`;
    await cache.del("publishedCreations");
    await cache.del(`userCreations:${userId}`);

    res.json({ success: true, content: dataUri });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql` INSERT INTO creations (user_id, prompt,content,type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${
      publish ?? false
    })`;
    await cache.del("publishedCreations");
    await cache.del(`userCreations:${userId}`);

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const  image  = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          backgroud_removal: "remove_the_background",
        },
      ],
    });

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;
    await cache.del("publishedCreations");
    await cache.del(`userCreations:${userId}`);

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const  image  = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
        transformation:[{effect: `gen_remove:${object}`}],
        resource_type: 'image'
    })

    await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;
    await cache.del("publishedCreations");
    await cache.del(`userCreations:${userId}`);

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const resumeReview = async (req, res) => {
    try {
      const { userId } = req.auth();
      const resume = req.file;
      const plan = req.plan;
  
      if (plan !== "premium") {
        return res.json({
          success: false,
          message: "This feature is only available for premium subscriptions",
        });
      }
  
      if(resume.size > 5 * 1024 *1024){
        return res.json({success: false, message: "Resume file size exceeds allows size (5MB)."})
      }

      const dataBuffer = fs.readFileSync(resume.path)

      const pdfData = await pdf(dataBuffer)

      const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and ares for improvement. Resume Content: \n\n${pdfData.text}`

      const response = await AI.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
  
      const content = response.choices[0].message.content;
  
      await sql` INSERT INTO creations (user_id, prompt,content,type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;
      await cache.del("publishedCreations");
      await cache.del(`userCreations:${userId}`);
  
      res.json({ success: true, content });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  };