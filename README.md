A production-ready, full-stack polling application built with the MERN stack featuring real-time vote updates via WebSockets, fairness controls to prevent abuse, and atomic vote handling for concurrent voters.


✨ Features
Core Functionality

Create Polls - Build custom polls with 2+ options
Shareable Links - Generate unique URLs for each poll
Real-Time Updates - See votes as they happen without refreshing
Single-Choice Voting - Each user can vote once per poll
Results Visualization - Live vote counts with percentage bars

Technical Highlights

🚀 WebSocket Integration - Instant vote updates across all viewers
🔒 Fairness Controls - Session-based voting + IP rate limiting
⚡ Atomic Operations - MongoDB $inc prevents race conditions
🎯 Clean Architecture - Separated routes, models, and socket handlers
📱 Responsive Design - Works on desktop, tablet, and mobile
🌐 Production Ready - Deployed on Vercel + Render + MongoDB Atlas

Try it live: https://polling-app-swart.vercel.app/


🛠️ Tech Stack
Frontend

React (Vite) - Fast, modern UI framework
React Router - Client-side routing
Socket.io Client - Real-time WebSocket connection
Axios - HTTP requests
CSS3 - Custom styling with gradients and animations

Backend

Node.js + Express - REST API server
Socket.io - WebSocket server for real-time updates
MongoDB + Mongoose - NoSQL database with ODM
express-rate-limit - IP-based rate limiting
cookie-parser - Session management

Deployment

Frontend: Vercel (Edge network, auto-deploy)
Backend: Render (Free tier with auto-scaling)
Database: MongoDB Atlas (512MB free cluster)


🔒 Fairness Controls
1. Session-Based Voting

Implementation: HTTP-only cookies with unique session IDs
Prevents: Multiple votes from same browser session
Limitation: User can clear cookies or use different browsers

2. IP-Based Rate Limiting

Implementation: express-rate-limit middleware
Limits: 50 vote attempts per 15 minutes per IP
Prevents: Automated bots, mass voting scripts
Limitation: Users behind same NAT share IP limit
