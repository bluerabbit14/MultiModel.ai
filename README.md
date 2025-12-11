# MultiModel.ai

A modern, multi-model AI chat assistant built with React. Access multiple state-of-the-art AI models through a single, unified interface powered by OpenRouter API.

## Features

- **Multiple AI Models**: Switch between different AI models including Grok-4 Fast, Mistral Devstral, and Llama 3.3 70B
- **Real-time Chat**: Interactive chat interface with smooth typing animations
- **Conversation History**: Search through your chat history with highlighted results
- **Model Switching**: Seamlessly switch between AI models mid-conversation
- **Markdown Support**: Rich text formatting with support for headers, lists, and paragraphs
- **Copy Messages**: One-click copy functionality for messages
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Sample Prompts**: Quick-start prompts to get you started
- **Clean UI**: Modern, intuitive interface with smooth animations

## Available AI Models

- **Grok-4 Fast** (xAI) - Fast and capable AI model
- **Mistral Devstral 2512** (Mistral AI) - Advanced conversational AI model
- **Llama 3.3 70B Instruct** (Meta) - Powerful 70B parameter instruction-tuned model

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

3. Create a `.env` file in the root directory:
```bash
REACT_APP_OPENROUTER_API_KEY=your-api-key-here
```

4. Replace `your-api-key-here` with your actual OpenRouter API key from [https://openrouter.ai/keys](https://openrouter.ai/keys)

5. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Important Notes

- The `.env` file must be in the root directory (same folder as `package.json`)
- The environment variable must be named exactly `REACT_APP_OPENROUTER_API_KEY` (case-sensitive)
- **You must restart the development server** after creating or modifying the `.env` file for changes to take effect

## Usage

1. Select an AI model from the sidebar
2. Type your message in the input field or click on a sample prompt
3. Press Enter or click the send button
4. Switch models anytime during your conversation
5. Use the search feature to find specific messages in your chat history
6. Copy any message by clicking the copy icon

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
