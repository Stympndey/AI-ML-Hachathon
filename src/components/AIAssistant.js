import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { Send, Bot, User, MessageCircle } from 'lucide-react';
import { getMistralResponse } from '../utils/mistralAPI';

function AIAssistant() {
  const { state, dispatch } = useHealth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chatHistory]);

  useEffect(() => {
    if (state.chatHistory.length === 0) {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          id: Date.now(),
          type: 'bot',
          message: `Hello! I'm your AI Health Assistant.

I can help you with:
• Symptom analysis
• Health information
• Medical guidance
• Treatment suggestions

What health concerns would you like to discuss today?`,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, []);

  const getAIResponse = async (userMessage) => {
    try {
      const systemPrompt = `You are a helpful AI health assistant. Provide accurate, helpful medical information while being clear about your limitations. 
      Always recommend consulting healthcare professionals for diagnosis and treatment. Be empathetic and informative.
      Keep responses concise and focused on the user's health question.`;
      
      return await getMistralResponse(userMessage, systemPrompt);
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or consult a healthcare professional for medical advice.";
    }
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
    setMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const response = await getAIResponse(message.trim());
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          message: response,
          timestamp: new Date().toISOString()
        };

        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: botMessage });
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          message: "I'm having trouble right now. Please consult a healthcare professional for medical advice.",
          timestamp: new Date().toISOString()
        };
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: errorMessage });
      }
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-500 rounded-lg">
          <MessageCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Health Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get health guidance and information
          </p>
        </div>
      </div>
      

      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {msg.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.message}
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    AI is thinking...
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t dark:border-gray-700 p-4">
          <div className="flex space-x-2 mb-3">
            <button
              onClick={() => {
                dispatch({ type: 'CLEAR_CHAT_HISTORY' });
                dispatch({
                  type: 'ADD_CHAT_MESSAGE',
                  payload: {
                    id: Date.now(),
                    type: 'bot',
                    message: `Hello! I'm your AI Health Assistant.\n\nI can help you with:\n• Symptom analysis\n• Health information\n• Medical guidance\n• Treatment suggestions\n\nWhat health concerns would you like to discuss today?`,
                    timestamp: new Date().toISOString()
                  }
                });
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health symptoms..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={() => setMessage('I have a fever')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs hover:bg-red-200"
            >
              🤒 Fever
            </button>
            <button 
              onClick={() => setMessage('I have a headache')}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs hover:bg-yellow-200"
            >
              🤕 Headache
            </button>
            <button 
              onClick={() => setMessage('I have chest pain')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs hover:bg-red-200"
            >
              💔 Chest Pain
            </button>
            <button 
              onClick={() => setMessage('I have a cough')}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200"
            >
              😷 Cough
            </button>
            <button 
              onClick={() => setMessage('I have diabetes')}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
            >
              🩺 Diabetes
            </button>
            <button 
              onClick={() => setMessage('I have high blood pressure')}
              className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs hover:bg-pink-200"
            >
              💓 Hypertension
            </button>
            <button 
              onClick={() => setMessage('I have asthma')}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200"
            >
              🫁 Asthma
            </button>
            <button 
              onClick={() => setMessage('I have joint pain')}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs hover:bg-orange-200"
            >
              🦴 Arthritis
            </button>
            <button 
              onClick={() => setMessage('I have anxiety')}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs hover:bg-indigo-200"
            >
              🧘 Mental Health
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;