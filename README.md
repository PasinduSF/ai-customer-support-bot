# Nova AI – E-Commerce Customer Support Chatbot 🤖🛍️

### Scenario 03 Implementation – Level 6 Mini Project

An intelligent, interactive customer support agent powered by **Google Gemini AI** for the module **EEX7340 – AI Techniques (2025)**.

## Overview

Nova AI is a smart virtual assistant designed for an e-commerce platform named **“TechStyle Store.”**  
It uses a **Large Language Model (LLM)** to understand natural language, context, and intent.  
The chatbot renders **interactive UI components** such as product cards, order trackers, and policy cards.

## Key Features

- 🧠 **Natural Language Understanding (NLU)** using Google Gemini
- 🎙️ **Voice Interaction** with Speech-to-Text
- 📦 **Order Tracking Stepper** (Ordered → Processing → Shipped → Delivered)
- 🛍️ **Smart Recommendations** with entity normalization
- 🎨 **Interactive UI Components**
- 🔄 **Fallback Logic** for product search

## Tech Stack

- **Next.js 14 (App Router)**
- **React + TypeScript**
- **Tailwind CSS**
- **Google Gemini API**
- **Lucide React Icons**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/nova-ai-commerce.git
cd nova-ai-commerce
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local`:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000/

## Project Structure

```
src/
├── app/
│   ├── api/chat/
│   ├── components/
│   └── page.tsx
├── constants/
├── enums/
└── types/
```

## How It Works

1. User inputs text/voice
2. Gemini processes with structured JSON response
3. Backend logic queries mock database
4. Frontend renders components (Stepper, Product Cards, etc.)

## Demo Highlights

- “I need running shoes” → Footwear recommendations
- “Check order ORD-123-ABC” → Shipping progress bar
- “Return policy?” → Visual return policy card

## Academic Info

Created for **EEX7340 – AI Techniques Module (2025)**  
Level 6 Mini Project
