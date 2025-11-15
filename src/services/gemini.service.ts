import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export interface AutomationInsight {
    title: string;
    summary: string;
    key_takeaways: string[];
    mentioned_tools: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // This will be populated by the build environment
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getAutomationInsights(blogContent: string): Promise<AutomationInsight> {
    const prompt = `
      Você é um especialista em engenharia de automação. Analise o seguinte post de blog e extraia as informações mais importantes para um profissional da área.
      
      O conteúdo do post é:
      ---
      ${blogContent}
      ---
      
      Responda estritamente no formato JSON solicitado. Forneça um título conciso para o insight, um resumo de 2-3 frases, uma lista dos principais aprendizados (key_takeaways), e uma lista das ferramentas ou tecnologias mencionadas (mentioned_tools). Se nenhuma ferramenta for mencionada, retorne um array vazio.
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Um título curto e impactante para o insight (máximo 10 palavras).'
              },
              summary: {
                type: Type.STRING,
                description: 'Um resumo conciso do post em 2-3 frases.'
              },
              key_takeaways: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'Uma lista de 3 a 5 pontos chave ou aprendizados do artigo.'
              },
              mentioned_tools: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: 'Uma lista de ferramentas, softwares ou tecnologias específicas mencionadas no artigo. Se nenhuma for mencionada, retorne um array vazio.'
              }
            },
            required: ['title', 'summary', 'key_takeaways', 'mentioned_tools']
          },
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as AutomationInsight;

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Falha ao se comunicar com a API do Gemini.");
    }
  }
}