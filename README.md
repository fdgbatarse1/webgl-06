# WebGL Homework 06 - 2D Scene with Interactive Shader Material

## 📹 Demo Video

[![Watch the video](/public/images/readme/gallery.png)](https://www.loom.com/share/7fee8af772b84d5fad741f0d2c520adb?sid=c6ebbf42-3398-4e4b-90d4-60611541ec0b)

## 📋 Summary

This project implements a 2D scene using planes arranged in a circular gallery with custom shader materials:

- **2D Scene Layout** - Vertical planes organized in a spherical arrangement creating an interactive gallery
- **Custom Shader Material** - Fragment shader with dissolve effect using noise texture and edge glow
- **Interactive Controls** - Drag to rotate gallery, hover effects with animated dissolve transitions
- **GUI Controls** - Real-time adjustment of radius, tilt, edge size/color, dissolve speed, and noise scale

## 🎨 Implementation Details

### Shader Material Design

The shader implementation focuses on creating an aesthetic dissolve effect with the following approach:

- **Noise-based Dissolve** - Using a generated noise texture to create organic dissolve patterns when hovering over gallery items
- **Edge Glow Effect** - Smooth step function creates a glowing edge at the dissolve boundary, with customizable color and thickness
- **Uniforms Used** - `uTexture` (image), `uNoiseMap` (dissolve pattern), `uProgress` (animation state), `uEdge` (glow thickness), `uEdgeColor` (glow color), `uNoiseScale` (pattern size)
- **Performance Considerations** - Early return when no effect is active, efficient discard for dissolved pixels

### Interaction Design

- **Drag Rotation** - Mouse/touch drag rotates the entire gallery smoothly with damping
- **Hover Effects** - Raycasting detects hovered planes and triggers dissolve animation
- **Smooth Transitions** - Different lerp speeds for dissolve in/out create responsive yet smooth interactions

## 🚀 How to Run

### Prerequisites

- Node.js (version 16 or higher)
- npm package manager

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/fdgbatarse1/webgl-06.git
   cd webgl-06
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
   - You should see a circular gallery of images with interactive shader effects
   - Drag to rotate the gallery and hover over images to see the dissolve effect with glowing edges

## 🔗 Links

- **Repository**: https://github.com/fdgbatarse1/webgl-06
- **Live Demo**: https://webgl-06.vercel.app/
