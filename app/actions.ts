'use server'

import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface AIConfig {
  model: string
  apiKey: string
}

export async function categorizeNote(content: string, aiConfig: AIConfig): Promise<string> {
  try {
    if (!aiConfig.apiKey) {
      throw new Error(`API key is required for ${aiConfig.model}`)
    }

    switch (aiConfig.model) {
      case 'chatgpt': {
        const openai = new OpenAI({ apiKey: aiConfig.apiKey })
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that categorizes notes. You must respond with a single word or short phrase that best categorizes the given note. Common categories include: Work, Personal, Ideas, Tasks, Meetings, Research, Shopping, Health, Travel, Education. Only respond with the category name, nothing else.'
            },
            {
              role: 'user',
              content
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        })

        const category = response.choices[0]?.message?.content?.trim()
        if (!category) {
          throw new Error('No category received from OpenAI')
        }
        return category
      }

      case 'gemini': {
        const genAI = new GoogleGenerativeAI(aiConfig.apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Categorize this note with a single word or short phrase. Choose from these categories: Work, Personal, Ideas, Tasks, Meetings, Research, Shopping, Health, Travel, Education. Only respond with the category name, nothing else.

Note: "${content}"`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const category = response.text().trim()
        
        if (!category) {
          throw new Error('No category received from Gemini')
        }

        // Clean up the response
        const cleanCategory = category
          .replace(/^["'\[\{]+|["'\]\}]+$/g, '') // Remove quotes, brackets
          .replace(/^category:?\s*/i, '') // Remove "Category:" prefix
          .trim()

        return cleanCategory
      }

      case 'mistral': {
        return 'Uncategorized (Mistral implementation pending)'
      }

      default:
        throw new Error('Invalid AI model selected')
    }
  } catch (error) {
    console.error('Error categorizing note:', error)
    throw error // Re-throw the error to handle it in the UI
  }
}

