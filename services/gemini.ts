import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAi = () => {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Assume this variable is pre-configured, valid, and accessible.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        console.error("API Key is missing! Make sure API_KEY is set in environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey: apiKey });
};

const SYSTEM_INSTRUCTION = `
Ты — AI-бэкенд для сатирического мобильного приложения в стиле "Postal 2". 
Тон: циничный, саркастичный, грязный, абсурдный и с черным юмором, но СТРОГО БЕЗ НАСИЛИЯ.
Представь себя жителем сумасшедшего, грязного, сломанного провинциального городка, который ненавидит поручения.
Используй сленг вроде "чувак", "приятель", но избегай жесткого мата или описания кровавых сцен.
Фокусируйся на неудобствах современной жизни, очередях, бюрократии, ЖКХ и плохой погоде.
Отвечай исключительно на РУССКОМ языке.
`;

export const generateAbsurdTask = async (task: string): Promise<string> => {
  const ai = getAi();
  if (!ai) return `Иди сделай "${task}". Я не могу придумать шутку (Нет API Key).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Перепиши эту скучную задачу: "${task}" в цель квеста для циничного персонажа видеоигры. Сделай описание раздражающим, эпичным, но глупым, или подозрительно бюрократическим. Максимум 20 слов.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.2,
      },
    });
    return response.text ? response.text.trim() : `Просто сделай "${task}".`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Просто сделай "${task}" и не задавай вопросов.`;
  }
};

export const generateExcuse = async (task: string): Promise<string> => {
    const ai = getAi();
    if (!ai) return "У меня лапки.";
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Придумай абсурдную, параноидальную или ленивую отмазку, почему я НЕ выполнил задачу: "${task}". Используй теории заговора, инопланетян, лень или плохую погоду. Максимум 1 предложение.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 1.4,
        },
      });
      return response.text ? response.text.trim() : "Мне просто лень.";
    } catch (error) {
      return "Мне просто лень.";
    }
  };

export const generateMadnessEvent = async (): Promise<{ title: string; description: string; buff: string }> => {
  const ai = getAi();
  if (!ai) {
    return {
      title: "Потеря соединения",
      description: "Интернета нет. Наверное, инопланетяне перегрызли кабель. Или ты просто не заплатил.",
      buff: "-100 Связь"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Сгенерируй событие 'Безумие дня', которое могло бы произойти в странном, грязном провинциальном городке в СНГ. Это должно быть смешно и раздражающе.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            buff: { type: Type.STRING, description: "Фейковое изменение статов RPG, например '+5 Вонь'" },
          },
          required: ["title", "description", "buff"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response");
    return JSON.parse(text);
  } catch (error) {
    return {
      title: "Тихий день",
      description: "Ничего не произошло. Это подозрительно.",
      buff: "+0 Тревожность"
    };
  }
};

export const generateInsult = async (): Promise<string> => {
    const ai = getAi();
    if (!ai) return "Тыканье в кнопки не исправит твою жизнь.";
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Дай короткую, саркастичную, смешную прожарку (roast) по поводу того, что пользователь тыкает кнопку в приложении, чтобы снять стресс.",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 50,
          temperature: 1.3
        },
      });
      return response.text ? response.text.trim() : "Тебе уже весело?";
    } catch (error) {
      return "Тебе уже весело?";
    }
  };

export const generatePsychProfile = async (name: string): Promise<string> => {
    const ai = getAi();
    if (!ai) return "Данные засекречены (или утеряны уборщицей).";
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Составь короткую (максимум 2 предложения), смешную, псевдо-бюрократическую характеристику для досье на человека по имени "${name}". Укажи на склонность к лени, странные привычки или паранойю. Стиль: полицейский отчет в сумасшедшем доме.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 100,
          temperature: 1.1
        },
      });
      return response.text ? response.text.trim() : "Субъект скучен и не вызывает интереса.";
    } catch (error) {
      return "Субъект скучен и не вызывает интереса.";
    }
};

// --- Audio / TTS Section ---

let audioContext: AudioContext | null = null;

const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): AudioBuffer => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const playTts = async (text: string) => {
    const ai = getAi();
    
    // Fallback if no API key
    if (!ai) {
        console.warn("No API key for TTS, using fallback.");
        fallbackTts(text);
        return;
    }

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Fenrir is usually deeper/rougher
                    },
                },
            },
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            const pcmData = decodeBase64(audioData);
            const audioBuffer = decodeAudioData(pcmData, audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        } else {
            throw new Error("No audio data received");
        }
    } catch (e) {
        console.error("Gemini TTS Failed, falling back", e);
        fallbackTts(text);
    }
};

const fallbackTts = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    u.pitch = 0.5; // Very low pitch for fallback
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
};
