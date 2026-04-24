const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const { SourceMapConsumer } = require('source-map');

/**
 * Process a source map from either a URL or a local file path
 * @param {string} input - URL or file path to the source map
 */
async function processSourceMap(input) {
    try {
        let mapContent;
        let hostname = 'local';

        // Check if input is a URL or a file path
        if (input.startsWith('http://') || input.startsWith('https://')) {
            // Handle URL input
            console.log(`Fetching source map from URL: ${input}`);
            const sourceUrl = new URL(input);
            hostname = sourceUrl.hostname;
            const response = await axios.get(input);
            mapContent = response.data;
        } else {
            // Handle file path input
            console.log(`Reading source map from file: ${input}`);
            const absolutePath = path.resolve(input);
            mapContent = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
        }

        // Process the source map
        const consumer = await new SourceMapConsumer(mapContent);

        // Process and save each source file
        consumer.sources.forEach((source) => {
            console.log(`Original Source: ${source}`);

            // Get the source content from the source map
            const sourceContent = consumer.sourceContentFor(source);
            console.log({sourceContent})
            if (sourceContent) {
                // Normalize the source path
                const normalizedSource = source.replace(/^webpack:\/\//, '').replace(/\.\.\//g, '');
                const outputFilePath = path.join('./sources', hostname, normalizedSource);

                // Create directories recursively if they don't exist
                fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

                // Write the source content to the normalized path
                fs.writeFileSync(outputFilePath, sourceContent, 'utf8');
                console.log(`Saved: ${outputFilePath}`);
            }
        });

        consumer.destroy();
        console.log('Source map processed successfully.');
    } catch (error) {
        console.error(`Error processing source map: ${error.message}`);
    }
}

function askUserForInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the URL or file path of the source map: ', (input) => {
        if (!input) {
            console.error('No input provided. Exiting...');
            rl.close();
            return;
        }

        processSourceMap(input)
            .then(() => rl.close())
            .catch((error) => {
                console.error(`Failed to process the source map: ${error.message}`);
                rl.close();
            });
    });
}

// Start the process by asking for input
askUserForInput();