# LLM TCO and GPU Sizing Calculator

A comprehensive web application for estimating optimal server configurations and costs for deploying Large Language Models (LLMs). Built with React and designed with the same aesthetic as gruve.ai.

## 🚀 Features

- **Hardware Sizing**: Intelligent GPU, CPU, memory, and storage recommendations
- **TCO Analysis**: Comprehensive cost analysis including CapEx and OpEx calculations
- **Cloud vs On-Premises**: Side-by-side deployment cost comparisons
- **Model Comparison**: Interactive comparison of different LLM models
- **Real-time Validation**: Input validation with helpful error messages and warnings
- **Optimization Suggestions**: AI-powered recommendations for cost and performance optimization

## 🎯 Supported Models

- Llama 3 (8B, 70B parameters)
- Mistral 7B
- Falcon (7B, 40B, 180B parameters)
- Mixtral 8x7B
- Gemma 7B
- Claude 3 Haiku
- GPT-NeoX 20B

## 🛠️ Technology Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for interactive data visualizations
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📊 Architecture

This is a **static React application** that runs entirely in the browser:
- No backend server required
- All calculations performed client-side
- Data stored in JSON files bundled with the app
- Can be deployed to any static hosting service

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/llm-tco-calculator.git
cd llm-tco-calculator
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
pnpm run build
```

The built files will be in the `dist/` directory.

## 🌐 Deployment on Render.com

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/llm-tco-calculator.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Static Site"
3. Connect your GitHub repository
4. Configure the deployment:
   - **Name**: `llm-tco-calculator`
   - **Branch**: `main` (or your preferred branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `pnpm install && pnpm run build`
   - **Publish Directory**: `dist`

5. Click "Create Static Site"

### Step 3: Environment Variables (if needed)

No environment variables are required for this static application.

### Step 4: Custom Domain (Optional)

1. In your Render dashboard, go to your static site
2. Navigate to "Settings" → "Custom Domains"
3. Add your custom domain and follow the DNS configuration instructions

## 📁 Project Structure

```
llm-calculator/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   └── ModelComparison.jsx
│   ├── data/             # JSON data files
│   │   ├── llm_models.json
│   │   ├── gpu_specifications.json
│   │   └── cloud_pricing.json
│   ├── utils/            # Utility functions
│   │   ├── calculator.js
│   │   └── validation.js
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   └── main.jsx          # Application entry point
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Configuration

### Adding New Models

Edit `src/data/llm_models.json` to add new LLM models with their specifications.

### Updating GPU Specifications

Edit `src/data/gpu_specifications.json` to update GPU pricing and specifications.

### Cloud Pricing Updates

Edit `src/data/cloud_pricing.json` to update cloud provider pricing information.

## 🎨 Customization

The application uses Tailwind CSS for styling with a dark gradient theme and green/cyan accents.

## 📈 Performance

- **Bundle Size**: ~762KB (minified)
- **Load Time**: Sub-second on modern connections
- **Calculation Speed**: Real-time results (<1 second)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the AI/ML community**
