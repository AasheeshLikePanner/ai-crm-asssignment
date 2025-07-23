import app from './app.js';
import { startAIProcessor } from './aiProcessor.js';

console.log("Starting the server...");

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
    startAIProcessor(); // Start the AI processor
});

console.log("Server setup complete.");