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
      // Use CoinGecko's public API
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data[symbol.toLowerCase()] && data[symbol.toLowerCase()].usd) {
        const price = data[symbol.toLowerCase()].usd;
        return {
          content: [{
            type: "text",
            text: `${symbol} is currently $${price.toLocaleString()} USD`
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: `Could not find price data for ${symbol}. Make sure to use the correct coin ID (e.g., bitcoin, ethereum)`
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