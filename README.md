# AI-Powered UX Design Platform

## Overview
aiuxpot is a powerful local-first UX design platform that combines AI capabilities with traditional design tools. It allows developers to create, manage, and test design projects while maintaining data privacy and control.

## Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher) or yarn (v1.22.0 or higher)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/aiuxpot.git
cd aiuxpot

# Install dependencies for both client and server
npm install
cd server && npm install && cd ..

# Set up environment variables
cp .env.example .env
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3001
WEBSOCKET_PORT=3003
NODE_ENV=development

# File System Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
CACHE_DURATION=86400000  # 24 hours in milliseconds
```

### Development Server
```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3003

## Project Structure
```
aiuxpot/
├── src/               # Frontend source code
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── pages/         # Page components
├── server/            # Backend source code
│   ├── virtualFs.ts   # Virtual file system
│   └── fileServer.ts  # Express server
└── Documentation/     # Project documentation
```

## Available Scripts
- `npm run dev`: Start frontend development server
- `npm run server`: Start backend server
- `npm run build`: Build production bundle
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run test`: Run tests (when implemented)

## Development Features
- Real-time file preview
- Project-based file management
- WebSocket-based live updates
- Integrated code editor
- AI-powered design suggestions (coming soon)

## Troubleshooting Common Issues

### WebSocket Connection Issues
If you experience WebSocket connection problems:
1. Ensure both frontend and backend servers are running
2. Check if ports 3001 and 3003 are available
3. Verify WebSocket URL in frontend configuration

### File Loading Issues
If files don't load properly:
1. Clear browser cache
2. Restart both frontend and backend servers
3. Check browser console for specific error messages

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, please:
1. Check the [Documentation](./Documentation) folder
2. Open an issue on GitHub
3. Contact the development team
