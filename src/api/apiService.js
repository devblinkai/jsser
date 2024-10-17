// src/api/apiService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const sendPrompt = async ({ html, css,selectedHtml,selectedCss, js, error,extractedCode, messages, prompt,email }) => {

  try {
    const filteredMessages = messages.filter(item => item.role !== 'error');

    const response = await axios.post(`${apiUrl}/openai/prompt`, {
      html: html ,
      css: css ,
      js: js || "<js code here>",
      selectedHtml:selectedHtml,
      selectedCss:selectedCss,
      error: error || "",
      extractedCode: extractedCode,
      messages: filteredMessages,
      prompt: prompt,
      email: email
    });

    return response.data;
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    throw error;
  }
};
