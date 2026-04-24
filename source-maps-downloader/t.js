import https from 'https';

import { extractChunkReferences } from './extractor.js';
import axios from "axios";
async function fetchText(url) {


    const response = await axios.get(url, {
        responseType: "text", // or "arraybuffer" if you want to save binary files
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Accept":
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            //"Referer": "",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        },
        decompress: true, // handles gzip/br automatically
        maxRedirects: 5,
        timeout: 10000,
        httpsAgent: new (await import("https")).Agent({keepAlive: true}),
    });
    return response.data;

}

// Run test
const testUrls = [
  'http://localhost/new.js',
  // Add your second URL here for testing
];

for (const url of testUrls) {
  console.log('\n' + '='.repeat(80));
  console.log(`Testing URL: ${url}`);
  extractChunkReferences(await fetchText(url))
    .then(result => {
      console.log(`\nFound ${result.size} chunks:`);
      const sorted = [...result].sort();
      sorted.forEach(chunk => console.log(chunk));
    })
    .catch(console.error);
}