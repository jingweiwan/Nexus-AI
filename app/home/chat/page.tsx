'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { SendIcon, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import cx from 'classnames';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Weather } from '@/components/ui/weather';
import { Switch } from '@/components/ui/switch';

// 模型配置
const MODEL_CONFIG = [
  { id: 'openai', name: 'OpenAI', available: false },
  { id: 'xai', name: 'Grok', available: true },
  { id: 'deepseek', name: 'DeepSeek', available: true }
];

export default function Page() {
  const [model, setModel] = useState<string>('xai');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const { messages, input, handleSubmit, handleInputChange, status, data, stop } =
    useChat({
      api: '/api/chat',
      body: {
        model: model,
        useWebSearch: useWebSearch,
      },
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // 监听状态变化，处理错误
  useEffect(() => {
    if (status === 'error') {
      setErrorMessage('抱歉，请求处理出错，请稍后再试');
    } else {
      setErrorMessage('');
    }
  }, [status]);

  // 监听滚动事件，当用户手动滚动时禁用自动滚动
  useEffect(() => {
    const handleScroll = () => {
      const chatContainer = document.querySelector('.chat-container');
      if (!chatContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = chatContainer as HTMLElement;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 50;

      setAutoScroll(isScrolledToBottom);
    };

    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

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

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };

  const handleRetry = () => {
    setErrorMessage('');
    // 可以在这里添加重试逻辑
  };

  const prompts = [
    "如何分析期权定价？",
    "解释隐含波动率",
    "什么是看涨期权策略？",
    "如何管理期权风险？"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-6 mx-auto">
      <div className="mb-4 flex justify-end space-x-2">
        {MODEL_CONFIG.map((modelItem) => (
          <button
            key={modelItem.id}
            onClick={() => modelItem.available && handleModelChange(modelItem.id)}
            disabled={!modelItem.available}
            className={`px-3 py-1 rounded-md transition-all duration-200 flex items-center space-x-1
              ${model === modelItem.id ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}
              ${!modelItem.available ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <span>{modelItem.name}</span>
            {!modelItem.available && (
              <span className="text-xs flex items-center" title="暂不可用">
                <AlertCircle className="h-3 w-3 ml-1" />
              </span>
            )}
          </button>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 flex-1 overflow-y-auto mb-4 relative chat-container"
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
              一个基于AI大模型的智能期权交易助手
            </motion.p>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              {prompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.03, backgroundColor: "#e5e7eb" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-gray-200 p-3 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
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
                        case 'tool-invocation':
                          // return (
                          //   <div key={index} className="bg-blue-50 rounded-lg p-4 my-2 border border-blue-200">
                          //     <div className="flex items-center mb-2">
                          //       <span className="text-blue-600 font-medium mr-2">工具调用:</span>
                          //       <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{part.toolInvocation.toolName}</span>
                          //     </div>
                          //     <div>{JSON.stringify(part.toolInvocation)}</div>
                          //   </div>
                          // );

                          const { toolInvocation } = part;
                          const { toolName, toolCallId, state } = toolInvocation;

                          // 处理部分调用状态
                          if (state === 'partial-call') {
                            return (
                              <div key={`partial-${toolCallId}`} className="bg-blue-50 p-3 rounded-md my-2">
                                <div className="flex items-center text-sm text-blue-600 mb-1">
                                  <span className="font-medium">正在准备工具调用：</span>
                                  <span className="ml-1 bg-blue-100 px-2 py-0.5 rounded text-xs">
                                    {toolName}
                                  </span>
                                </div>
                                {toolName === 'webSearch' && toolInvocation.args?.query && (
                                  <div className="text-sm">
                                    搜索查询: <span className="font-medium">{toolInvocation.args.query}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          if (state === 'call') {
                            const { args } = toolInvocation;
                            return (
                              <div
                                key={toolCallId}
                                className={cx({
                                  skeleton: ['getWeather'].includes(toolName),
                                  'bg-blue-50 p-3 rounded-md my-2': true
                                })}
                              >
                                <div className="flex items-center text-sm text-blue-600 mb-1">
                                  <span className="font-medium">工具调用：</span>
                                  <span className="ml-1 bg-blue-100 px-2 py-0.5 rounded text-xs">
                                    {toolName}
                                  </span>
                                </div>
                                {toolName === 'getWeather' ? (
                                  <Weather />
                                ) : toolName === 'webSearch' && args?.query ? (
                                  <div className="text-sm">
                                    搜索查询: <span className="font-medium">{args.query}</span>
                                  </div>
                                ) : (
                                  <div>
                                    <h3>{args?.title}</h3>
                                    <p>{args?.content}</p>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          if (state === 'result') {
                            const { args, result } = toolInvocation;
                            return (
                              <div
                                key={toolCallId}
                                className={cx({
                                  skeleton: ['getWeather'].includes(toolName),
                                  'bg-blue-50 p-3 rounded-md my-2 transition-all duration-300': true
                                })}
                              >
                                <div className="flex items-center text-sm text-blue-600 mb-1">
                                  <span className="font-medium">工具调用结果：</span>
                                  <span className="ml-1 bg-blue-100 px-2 py-0.5 rounded text-xs">
                                    {toolName}
                                  </span>
                                </div>
                                {toolName === 'getWeather' ? (
                                  <Weather weatherAtLocation={result}/>
                                ) : toolName === 'webSearch' ? (
                                  <div className="text-sm">
                                    <div className="flex items-center mb-2">
                                      <span className="font-medium">搜索查询:</span>
                                      <span className="ml-1">{args.query}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 italic mb-1">
                                      {status === 'submitted' ? `已获取搜索结果，AI正在分析中...` :  status === 'ready' ?  `AI分析完成` : `AI生成中...`}
                                    </div>
                                    <div className="text-xs text-gray-500 italic">
                                      结果将在下方文本中呈现
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h3>{args.title}</h3>
                                    <p>{args.content}</p>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          default:
                          return null;
                      }
                    })}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 添加AI正在输入的状态显示 */}
            {status === 'error' ? (
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
                  className="max-w-[80%] rounded-lg p-4 shadow-sm bg-red-50 text-red-800 border border-red-200"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium">请求出错</span>
                  </div>
                  <p>{errorMessage || '发生了一个错误，请稍后再试'}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors duration-200"
                  >
                    重试
                  </button>
                </motion.div>
              </motion.div>
            ) : status === 'submitted' && (
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
                  <div className="flex items-center space-x-2">
                    {status === 'submitted' ? (
                      <span>正在连接</span>
                    ) : (
                      null
                    )}
                    <span className="flex">
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0 }}
                        className="text-gray-500"
                      >.</motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
                        className="text-gray-500"
                      >.</motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4 }}
                        className="text-gray-500"
                      >.</motion.span>
                    </span>
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
        <div className="relative">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题..."
            disabled={status !== 'ready' && status !== 'error'}
            className="w-full p-4 pt-12 pr-12 pb-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm transition-all duration-200"
            rows={3}
          />

          <div className="absolute top-4 left-2 flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="web-search"
                checked={useWebSearch}
                onCheckedChange={setUseWebSearch}
                className="data-[state=checked]:bg-primary"
              />
              <label htmlFor="web-search" className="text-xs text-gray-600 cursor-pointer">
                启用网络搜索
              </label>
            </div>
          </div>

          {status === 'ready' || status === 'error' ? (
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
        </div>
      </motion.form>
    </div>
  );
}