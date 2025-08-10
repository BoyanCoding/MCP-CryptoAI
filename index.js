import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "crypto-price-server",
  version: "1.0.0"
});

server.registerTool("get_crypto_price",
  {
    title: "Get Cryptocurrency Price",
    description: "Get current price of a cryptocurrency from CoinGecko",
    inputSchema: {
      symbol: z.string().describe("Cryptocurrency symbol (e.g., bitcoin, ethereum)")
    }
  },
  async ({ symbol }) => {
    try {
      const response = await fetch(`https://www.coingecko.com/en/coins/${symbol.toLowerCase()}`);
      const html = await response.text();

      const scriptMatch = html.match(/<script type="application\/ld\+json">\s*({[^}]*"ExchangeRateSpecification"[^}]*})\s*<\/script>/);

      if (scriptMatch) {
        const data = JSON.parse(scriptMatch[1]);
        const price = data.currentExchangeRate?.price;
        const currency = data.currentExchangeRate?.priceCurrency || "USD";

        if (price) {
          return {
            content: [{
              type: "text",
              text: `${data.name} (${data.currency}) is currently $${price.toFixed(2)} ${currency}`
            }]
          };
        }
      }

      return {
        content: [{
          type: "text",
          text: `Could not find price data for ${symbol}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching price for ${symbol}: ${error.message}`
        }]
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);