# Dreamflux AI - Neural Image Generation Platform

A modern, futuristic AI image generation interface that integrates with ComfyUI and Civitai models.

## Features

### 🎨 Modern UI/UX
- Futuristic cyberpunk-inspired design with dark grey and hot pink theme
- Smooth animations and micro-interactions using Framer Motion
- Responsive design that works on all devices
- Advanced neural-themed components and styling

### 🤖 AI Integration
- **ComfyUI Integration**: Direct connection to ComfyUI backend for image generation
- **Civitai Models**: Browse and select from thousands of community models
- **Real-time Generation**: WebSocket connection for live generation progress
- **Multiple Model Support**: SD1.5, SDXL, Flux, and SD3.5 compatibility

### ⚙️ Advanced Controls
- Comprehensive generation parameters (steps, guidance, sampling methods)
- Quality enhancement options (face detail, quality boost)
- Multiple aspect ratios and custom sizing
- Advanced neural settings with intuitive controls

### 🔧 Technical Features
- TypeScript for type safety
- Modular architecture with clean separation of concerns
- Caching system for optimal performance
- Error handling and connection management
- Real-time status monitoring

## Setup Instructions

### Prerequisites
1. **ComfyUI**: Install and run ComfyUI on your local machine
   - Download from: https://github.com/comfyanonymous/ComfyUI
   - Default URL: `http://localhost:8188`

2. **Node.js**: Version 18 or higher

### Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Configure ComfyUI Connection**
   - Ensure ComfyUI is running on `http://localhost:8188`
   - The app will automatically attempt to connect
   - Check connection status in the top-right corner

### ComfyUI Setup

1. **Install ComfyUI**
   ```bash
   git clone https://github.com/comfyanonymous/ComfyUI.git
   cd ComfyUI
   pip install -r requirements.txt
   ```

2. **Download Base Models**
   - Place your checkpoint files in `ComfyUI/models/checkpoints/`
   - Recommended models:
     - SD1.5: `v1-5-pruned-emaonly.ckpt`
     - SDXL: `sd_xl_base_1.0.safetensors`

3. **Start ComfyUI**
   ```bash
   python main.py --listen
   ```

### Civitai Integration

The app automatically fetches models from Civitai's public API:
- Browse popular models by category
- Search for specific models
- View model details and sample images
- Filter by base model type (SD1.5, SDXL, Flux, SD3.5)

## Usage

### Basic Generation
1. **Select Model**: Click on the model selector to browse Civitai models
2. **Choose Style**: Select a style preset (optional)
3. **Enter Prompt**: Describe what you want to generate
4. **Configure Settings**: Adjust steps, guidance, and other parameters
5. **Generate**: Click "Generate Dream" to start the process

### Advanced Features
- **Advanced Settings**: Toggle to access detailed generation parameters
- **Real-time Progress**: Monitor generation progress via WebSocket
- **Recent Generations**: View your recent creations
- **Model Management**: Browse and select from thousands of community models

## Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API services (ComfyUI, Civitai)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and configuration
└── App.tsx             # Main application component
```

### Key Services
- **ComfyUIService**: Handles WebSocket connections and workflow management
- **CivitaiService**: Manages model browsing and caching
- **Custom Hooks**: `useComfyUI` and `useCivitai` for state management

### Workflow System
The app generates ComfyUI workflows dynamically based on user inputs:
- Automatic node graph creation
- Parameter mapping from UI to workflow
- Support for different model architectures

## Configuration

### Environment Variables
Create a `.env` file for custom configuration:
```env
VITE_COMFYUI_URL=http://localhost:8188
VITE_CIVITAI_API_KEY=your_api_key_here
```

### Custom Models
To add custom models:
1. Place model files in ComfyUI's model directory
2. Restart ComfyUI
3. Models will appear in the selection interface

## Troubleshooting

### Common Issues

1. **ComfyUI Connection Failed**
   - Ensure ComfyUI is running on the correct port
   - Check firewall settings
   - Verify WebSocket support

2. **Models Not Loading**
   - Check internet connection for Civitai API
   - Verify model files are in correct ComfyUI directories
   - Restart ComfyUI after adding new models

3. **Generation Errors**
   - Check ComfyUI console for error messages
   - Ensure sufficient VRAM for selected model
   - Verify model compatibility with parameters

### Performance Tips
- Use smaller image sizes for faster generation
- Enable quality boost only when needed
- Monitor system resources during generation
- Use appropriate sampling steps (20-30 for most cases)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ComfyUI team for the excellent backend framework
- Civitai community for the model ecosystem
- Framer Motion for smooth animations
- Tailwind CSS for styling system