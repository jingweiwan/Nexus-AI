import { z } from 'zod';
import Exa from 'exa-js';
import { tool } from 'ai';

export const exa = new Exa(process.env.WEB_SEARCH_API_KEY);

export const webSearch = tool({
  description: 'Search the web for up-to-date information',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query'),
  }),
  execute: async ({ query }) => {
    // 在搜索查询中添加当前时间信息
    const now = new Date();
    console.log(now);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const enhancedQuery = `${query} ${formattedDate}`;

    const { results } = await exa.searchAndContents(enhancedQuery, {
      livecrawl: 'always',
      numResults: 15,
    });
    return results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.text.slice(0, 1000), // take just the first 1000 characters
      publishedDate: result.publishedDate,
    }));
  },
});