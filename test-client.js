import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["index.js"]
});

const client = new Client(
  {
    name: "crypto-test-client",
    version: "1.0.0"
  }
);

await client.connect(transport);

// List available tools
console.log("Available tools:");
const tools = await client.listTools();
console.log(tools);

// Test the get_crypto_price tool
console.log("\nTesting crypto price tool with 'bitcoin':");
const result = await client.callTool({
  name: "get_crypto_price",
  arguments: {
    symbol: "bitcoin"
  }
});

console.log(result);

// Test with another cryptocurrency
console.log("\nTesting crypto price tool with 'ethereum':");
const result2 = await client.callTool({
  name: "get_crypto_price",
  arguments: {
    symbol: "ethereum"
  }
});

console.log(result2);

await client.close();