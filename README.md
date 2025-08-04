# WebGL Homework 05 - Custom Shader Material with Interactive Effects

## 📹 Demo Video

[![Watch the video](/public/images/shaders.png)](https://www.loom.com/share/e4aa278490064741a98567136f93e624?sid=3ec82a2f-5e8d-40ef-a523-37f88279f421)

## 📋 Summary

This project implements a custom shader material with interactive displacement effects:

- **Custom Shader Material** - Vertex and fragment shaders with noise-based displacement patterns
- **Multiple Uniforms** - Time, speed, mouse position, radius, strength, and color controls
- **Varying Variables** - Position, normal, UV, displacement, world position, and influence data
- **GUI Controls** - Real-time adjustment of radius, strength, speed, and colors
- **Mouse Interaction** - Dynamic effects based on mouse position

## 🚀 How to Run

### Prerequisites

- Node.js (version 16 or higher)
- npm package manager

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/fdgbatarse1/webgl-05.git
   cd webgl-05
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the URL shown in your terminal)
   - You should see an animated icosahedron with custom shader displacement effects
   - Use the GUI controls to adjust shader parameters and move your mouse to see interactive glow effects

## 🔗 Links

- **Repository**: https://github.com/fdgbatarse1/webgl-05
- **Live Demo**: https://webgl-05.vercel.app/
