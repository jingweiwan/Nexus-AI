import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: "获取特定位置的当前天气信息。仅当用户明确询问天气、温度、降水、湿度等天气相关信息时才使用此工具。如果用户没有明确询问天气，请不要使用此工具。",
  parameters: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ latitude, longitude }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&forecast_days=1&daily=sunrise,sunset&timezone=auto`,
    );

    const weatherData = await response.json();
    console.log(weatherData);
    return weatherData;
  },
});
