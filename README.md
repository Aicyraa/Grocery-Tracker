<div align="center">

# **_G r o c e r y  T r a c k e r 🛒_**

![Static Badge](https://img.shields.io/badge/React-blue?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge)
![Static Badge](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge)

</div>

A personal grocery budget tracker built as an installable PWA — log what you buy, see where your money's going, and ask an AI assistant about your spending.

## ✨Features

- Categorized grocery item tracking (add, edit, delete entries by category)
- Expense visualization with interactive charts (Recharts)
- Gemini API-powered chatbot to ask questions about your spending
- Installable as a Progressive Web App — works like a native app on desktop and mobile
- Local-storage persistence, so your data stays on your device
- Responsive forms for adding groceries, categories, and individual items

## 📲Install as an App (PWA)

Grocery Tracker is a Progressive Web App, so you can install it straight from the browser:

1. Open the [live demo](https://groceryio.netlify.app/) on desktop or mobile
2. Click the **Install** icon in the address bar (desktop) or **Add to Home Screen** (mobile)
3. Launch it like any other app — it works offline once installed

## 🛠️Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4
- **Charts:** Recharts
- **Forms:** React Hook Form
- **Routing:** React Router
- **AI:** Gemini API
- **PWA:** vite-plugin-pwa
- **Testing:** Vitest, @vitest/ui

## 🌲Tree Structure

```
Grocery-Tracker/
├── public/
│   ├── Grocery-Entries.json
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── chart/
│   │   │   └── ExpensesChart.tsx
│   │   ├── chat/
│   │   │   └── ChatBot.tsx
│   │   ├── forms/
│   │   │   ├── FormCategory.tsx
│   │   │   ├── FormGrocery.tsx
│   │   │   └── FormItem.tsx
│   │   ├── groceries/
│   │   │   ├── GroceryItems.tsx
│   │   │   ├── GroceryNav.tsx
│   │   │   ├── GroceryTab.tsx
│   │   │   └── GroceryView.tsx
│   │   └── ui/
│   │       ├── AnimatedModal.tsx
│   │       ├── Modal.tsx
│   │       └── TopNav.tsx
│   ├── css/
│   │   ├── App.css
│   │   ├── Grocery.css
│   │   └── index.css
│   ├── utils/
│   │   ├── analytics.util.ts
│   │   ├── calculate.util.ts
│   │   ├── categories.util.ts
│   │   ├── chatStorage.ts
│   │   ├── data.util.ts
│   │   ├── gemini.util.ts
│   │   ├── geminiKey.ts
│   │   ├── query.util.ts
│   │   └── storage.ts
│   ├── App.tsx
│   ├── iconMap.tsx
│   ├── main.tsx
│   ├── routes.tsx
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## ⚙️Installation

```bash
# clone the repo
git clone https://github.com/Aicyraa/Grocery-Tracker.git
cd Grocery-Tracker

# install dependencies
npm install

# set up your Gemini API key
# add your key wherever geminiKey.ts expects it (check that file for the exact variable)

# run the dev server
npm run dev
```

## 🧪Testing

```bash
npx vitest
```

Or open the Vitest UI:

```bash
npx vitest --ui
```

## 🔗Live Demo

[View it live](https://groceryio.netlify.app/)

## 📄License

This project is licensed under the MIT License — see the LICENSE file for details.
