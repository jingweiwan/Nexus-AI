'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { SendIcon, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status, data, stop } =
    useChat({
      api: '/api/deepseek-chat',
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  const handleStopGeneration = () => {
    stop();
  };

  const prompts = [
    "如何分析期权定价？",
    "解释隐含波动率",
    "什么是看涨期权策略？",
    "如何管理期权风险？"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] p-6 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 flex-1 overflow-y-auto mb-4 relative"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50 rounded-lg"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </motion.div>
            <motion.h3
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`${lusitana.className} text-xl font-medium mb-2`}
            >
              欢迎使用Nexus AI助手
            </motion.h3>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-4"
            >
              一个基于DeepSeek API的智能期权交易助手
            </motion.p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {prompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.03, backgroundColor: "#e5e7eb" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-gray-100 p-3 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <p className="font-medium text-sm">{prompt}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      switch (part.type) {
                        case 'text':
                          return message.role === 'user' ? (
                            <div key={index} className="whitespace-pre-wrap">
                              {part.text}
                            </div>
                          ) : (
                            <div key={index} className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  code({node, className, children, ...props}) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return match ? (
                                      <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  table({children}) {
                                    return (
                                      <div className="overflow-x-auto">
                                        <table className="border-collapse border border-gray-300 my-4 w-full">
                                          {children}
                                        </table>
                                      </div>
                                    );
                                  },
                                  th({children}) {
                                    return (
                                      <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-left">
                                        {children}
                                      </th>
                                    );
                                  },
                                  td({children}) {
                                    return (
                                      <td className="border border-gray-300 px-4 py-2">
                                        {children}
                                      </td>
                                    );
                                  }
                                }}
                              >
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 添加AI正在输入的空对话框 */}
            {status === 'submitted' && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[80%] rounded-lg p-4 shadow-sm bg-gray-100 text-gray-800"
                >
                  <div className="flex items-center space-x-1">
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0 }}
                      className="text-gray-500 text-lg"
                    >.</motion.span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
                      className="text-gray-500 text-lg"
                    >.</motion.span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4 }}
                      className="text-gray-500 text-lg"
                    >.</motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="relative"
      >
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题..."
          disabled={status !== 'ready'}
          className="w-full p-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm transition-all duration-200"
          rows={3}
        />
        {status === 'ready' ? (
          <motion.button
            type="submit"
            disabled={!input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 bottom-3 p-2 rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="发送"
            tabIndex={0}
          >
            <SendIcon className="h-5 w-5" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleStopGeneration}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 bottom-3 p-2 rounded-full bg-red-500 text-white transition-all duration-200"
            aria-label="中止"
            tabIndex={0}
          >
            <XCircle className="h-5 w-5" />
          </motion.button>
        )}
      </motion.form>

      <AnimatePresence>
        {status !== 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-2 text-sm text-muted-foreground"
          >
            {status === 'submitted' ? (
              <div className="flex items-center justify-center space-x-2">
                <span>正在连接</span>
                <span className="flex space-x-1">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4 }}
                  >.</motion.span>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>正在思考</span>
                <span className="flex space-x-1">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4 }}
                  >.</motion.span>
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}