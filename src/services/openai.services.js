import axios from 'axios';
import { getOpenAiApiKey } from '../utils/localStorage';

const OPENAI_API_CHAT_COMPLETION_URL = 'https://api.openai.com/v1/chat/completions';

export const processPrompt = async (openAIPromptMessageDto) => {  
  const {
    html,
    css,
    js,
    selectedHtml,
    selectedCss,
    error,
    messages,
    extractedCode,
    prompt,
  } = openAIPromptMessageDto;

  const systemMessage = {
    role: 'system',
    content:
      'You are an experienced senior front-end developer specialized in HTML, CSS, and JavaScript. If the user has provided PartOfTheCodeToBeModified it means that the user is pointing to that particular element in the given html,css,js code. You give responses only in the form of JSON format.',
  };

  let content = selectedHtml
    ? `PartialHTMLCode: ${selectedHtml}\nPartialCSSCode: ${selectedCss}\nCompleteJSCode: ${js}\nError: ${error || ''}\n\n${prompt}. Please note here I have provided the partial html and css code(particular element in the html) with complete js code of a web app, so while making changes you have complete freedom to make changes to html and css (but should be related to the provided element), but in case of Js you need to make changes only to code that is related to the provided html element, and you must return the entire javascript code with your changes. You must provide the corrected code in the following JSON format: {"html": "<html code here>", "css": "<css code here>", "js": "<js code here>", "response": "<explanation of your response>"}`
    : `HTML: ${html}\nCSS: ${css}\nJS: ${js}\nPartOfTheCodeToBeModified:${extractedCode}\nError: ${error || ''}\n\n${prompt} You must provide the corrected code in the following JSON format: {"html": "<html code here>", "css": "<css code here>", "js": "<js code here>", "response": "<explanation of your response>"}`;

  const userMessage = {
    role: 'user',
    content: content,
  };

  let allMessages = [systemMessage, ...messages, userMessage];

  while (true) {
    try {
      let userApikey = getOpenAiApiKey();
      if (!userApikey && allMessages.length >= 11) {
        throw new Error('API_KEY_MISSING');
      } else if (!userApikey) {
        userApikey = localStorage.getItem('defaultApiKey');
      }

      if (!userApikey) {
        throw new Error('API_KEY_MISSING');
      }

      const response = await axios.post(
        OPENAI_API_CHAT_COMPLETION_URL,
        {
          model: 'gpt-4',
          messages: allMessages,
          max_tokens: 2000,
          temperature: 0.5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userApikey}`,
          },
        }
      );

      const responseText = response.data.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error('Empty response from OpenAI');
      }

      console.log('OpenAI Response:', responseText);

      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);

      try {
        const parsedResponse = JSON.parse(jsonString);
        return parsedResponse;
      } catch (jsonError) {
        console.error('Error parsing JSON from OpenAI response:', jsonError);
        throw new Error('Invalid JSON response from OpenAI');
      }
    } catch (error) {
      
      if (error.message === 'API_KEY_MISSING') {
        throw error;
      } else if (error.response && error.response.status === 400 && error.response.data.error.code === 'context_length_exceeded') {
        if (allMessages.length <= 4) {
          throw new Error('Unexpected error occurred');
        }
        allMessages = [allMessages[0], ...allMessages.slice(3)];
        console.warn('Context length exceeded, retrying with trimmed messages');
      } else if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(`OpenAI API Error: ${error.response.data.error.message}`);
      } else if (error.request) {
        console.error('Network Error:', error.request);
        throw new Error('Network error while communicating with OpenAI API');
      } else {
        console.error('Unexpected Error:', error.message);
        throw new Error('Unexpected error occurred');
      }
    }
  }
};



export const isValidOpenAIKey = async(apiKey) => {
  const url = 'https://api.openai.com/v1/models';
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      return true;
    } else {
      console.error('API key validation failed:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}