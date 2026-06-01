# 🔋 Recharge

Recharge is a productivity web application that helps users stay focused during work sessions while encouraging healthy and intentional breaks.

## Problem

I often work on tasks that require deep concentration, such as newsletter research, studying, and software development. During these sessions, I either become distracted and lose momentum or continue working without any structure, which can lead to mental fatigue.

Before Recharge, I relied on my phone timer or simply estimated how long I had been working. This approach provided no session tracking, progress visibility, or structured break system.

Recharge was created to provide a simple way to manage focus sessions, maintain consistency, and encourage healthier work habits.

## Features

* Focus and break countdown timer
* Start, pause, and reset controls
* Custom work and break durations
* Session tracking
* Daily focus time monitoring
* Browser notifications for break reminders
* Sound alerts
* Data persistence using LocalStorage
* Responsive user interface
* Dark mode design

## Tech Stack

* React
* TypeScript
* Vite
* React Router
* Context API
* Custom Hooks
* Plain CSS
* LocalStorage API

## Why React?

I chose React because it is the framework I am most comfortable building with. Its component-based architecture made it easy to create reusable UI elements and organize application logic effectively.

React also provided a good opportunity to apply concepts such as custom hooks, Context API, state management, and component composition while building a practical product.

## Project Structure

```text
src/
├── components/
├── pages/
├── hooks/
├── context/
├── styles/
├── utils/
└── types/
```

## Installation

Clone the repository:

```bash
git clone <https://github.com/Prisca-01/recharge>
```

Navigate into the project:

```bash
cd recharge
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

## Live Demo

**Live URL:** https://recharge-liart.vercel.app/

## Future Improvements

* Mood check-ins after focus sessions
* Productivity streak tracking
* Weekly productivity analytics
* Enhanced focus insights and reporting
