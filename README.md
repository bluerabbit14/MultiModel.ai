# MultiModel.ai

A modern, multi-model AI chat assistant built with React. Access multiple state-of-the-art AI models through a single, unified interface powered by OpenRouter API.

## Features

- **Multiple AI Models**: Switch between different AI models including Google Gemma 3N E2B IT, Mistral Devstral, and Llama 3.3 70B
- **Real-time Chat**: Interactive chat interface with smooth typing animations
- **Conversation History**: Search through your chat history with highlighted results
- **Model Switching**: Seamlessly switch between AI models mid-conversation
- **Markdown Support**: Rich text formatting with support for headers, lists, and paragraphs
- **Copy Messages**: One-click copy functionality for messages
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Sample Prompts**: Quick-start prompts to get you started
- **Clean UI**: Modern, intuitive interface with smooth animations

## Available AI Models

All models are configured to use the free tier:

- **Google Gemma 3N E2B IT** (Google) - Fast and capable AI model from Google
- **Mistral Devstral 2512** (Mistral AI) - Advanced conversational AI model from Mistral
- **Llama 3.3 70B Instruct** (Meta) - Powerful 70B parameter instruction-tuned model from Meta

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MultiModel.ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (same folder as `package.json`):
   - Create a new file named `.env` (with the dot at the beginning)
   - Add the following line (replace `your-api-key-here` with your actual API key):
   ```bash
   REACT_APP_OPENROUTER_API_KEY=your-api-key-here
   ```
   - Make sure there are **no spaces** around the `=` sign
   - Get your API key from [https://openrouter.ai/keys](https://openrouter.ai/keys)

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Important Notes

- The `.env` file must be in the root directory (same folder as `package.json`)
- The environment variable must be named exactly `REACT_APP_OPENROUTER_API_KEY` (case-sensitive)
- **⚠️ CRITICAL: You must restart the development server** after creating or modifying the `.env` file for changes to take effect
  - Stop the server with `Ctrl+C`
  - Run `npm start` again
- Environment variables are only loaded when the server starts, not during runtime
- The `.env` file is automatically ignored by git (via `.gitignore`) to keep your API key secure

## Usage

1. **Start the app**: After setting up the `.env` file and restarting the server, the app will open at `http://localhost:3000`
2. **Select an AI model**: Choose from the available models in the sidebar
3. **Start chatting**: Type your message in the input field or click on a sample prompt
4. **Send messages**: Press Enter or click the send button
5. **Switch models**: Seamlessly switch between AI models anytime during your conversation
6. **Search history**: Use the search feature to find specific messages in your chat history
7. **Copy messages**: Click the copy icon on any message to copy it to your clipboard

## Technology Stack

- **React** 19.1.1 - UI framework
- **OpenRouter API** - Multi-model AI access
- **FontAwesome** - Icons
- **Create React App** - Build tooling

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Troubleshooting

### API Key Not Loading

If you see an error message about the API key not being configured:

1. **Verify the `.env` file exists** in the root directory (same folder as `package.json`)
2. **Check the file format**:
   - Must be named exactly `.env` (with the dot)
   - Must contain: `REACT_APP_OPENROUTER_API_KEY=your-api-key-here`
   - No spaces around the `=` sign
   - No quotes around the API key value
3. **Restart the development server**:
   - Stop the server with `Ctrl+C`
   - Run `npm start` again
4. **Check the browser console** for the environment check log to verify the API key is loaded

### Other Issues

- **Model not responding**: Check your OpenRouter API key is valid and has sufficient credits
- **CORS errors**: Ensure you're using the correct OpenRouter API endpoint
- **Build errors**: Make sure all dependencies are installed with `npm install`

## Project Structure

```
MultiModel.ai/
├── public/          # Static assets
├── src/
│   ├── config/     # Configuration files (OpenRouter settings)
│   ├── services/   # API service layer
│   ├── App.js      # Main application component
│   └── App.css     # Application styles
├── .env            # Environment variables (create this file)
└── package.json    # Dependencies and scripts
```

## License

© 2025 MultiModel.ai. All rights reserved.
