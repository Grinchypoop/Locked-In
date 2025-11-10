# 🌐 Hosting on ngrok - Setup Guide

ngrok is perfect for testing your Telegram Mini App before deploying to production. It creates a public URL that tunnels to your local development server.

## 📥 Step 1: Install ngrok

### Option A: Using Homebrew (macOS)
```bash
brew install ngrok
```

### Option B: Download from ngrok.com
1. Go to https://ngrok.com/download
2. Download for your OS
3. Extract the file
4. Move to a location in your PATH

### Option C: Using npm
```bash
npm install -g ngrok
```

## 🔑 Step 2: Get ngrok Authtoken

1. Go to https://dashboard.ngrok.com/signup (or login if you have account)
2. Create a free account
3. Go to https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken
5. Run:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## 🚀 Step 3: Start ngrok for Frontend

Once your **frontend is running** on `http://localhost:5173`:

```bash
ngrok http 5173
```

You'll see output like:
```
Session Status                online
Account                       your-email@gmail.com
Version                       3.x.x
Region                        us (United States)
Latency                       10ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:5173

Connections                   ttl     opn     dl      in      out
                              0       0       0       0B      0B
```

**Copy the HTTPS URL**: `https://abc123def456.ngrok.io`

## 📱 Step 4: Update BotFather Menu Button

1. Open Telegram
2. Message **@BotFather**
3. Send `/mybots`
4. Select **Izzylevis_bot**
5. Click **"Bot Settings"**
6. Click **"Menu Button"**
7. If already set, click the current URL to edit it
8. **Replace with your ngrok URL**: `https://abc123def456.ngrok.io`
9. Press "Done"

## ✅ Step 5: Test the App

1. Go back to Izzylevis_bot chat
2. Click the Menu button
3. Click "Open Web App"
4. Killjoy should load! 🎉

## 🔄 Full Setup (All 3 Terminals)

When testing, you need **3 terminal windows**:

**Terminal 1: Backend**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3: ngrok**
```bash
ngrok http 5173
# Exposes frontend at https://abc123def456.ngrok.io
```

## 🔗 How It Works

```
Telegram App
    ↓
Your Bot Menu Button (https://abc123def456.ngrok.io)
    ↓
ngrok tunnel
    ↓
Your Local Frontend (http://localhost:5173)
    ↓
Your Local Backend (http://localhost:3000)
    ↓
PostgreSQL Database
```

## 💡 Important Notes

- **ngrok URL changes each time** you restart it (unless you have paid plan)
- **Always update BotFather** with new ngrok URL
- **Keep all 3 terminals running** while testing
- **Stop ngrok when done** (Ctrl+C) to avoid leaving public tunnel open
- **Free tier is perfect** for development testing

## 🐛 Troubleshooting ngrok

### "Cannot connect to ngrok"
```bash
# Make sure you have authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE

# Restart ngrok
ngrok http 5173
```

### "Frontend not loading through ngrok"
- Check frontend is running on port 5173
- Verify ngrok shows "Forwarding" line
- Wait 5 seconds for ngrok to fully start
- Clear browser cache

### "Menu button not showing in Telegram"
- Restart Telegram app completely
- Make sure you updated BotFather URL correctly
- Use HTTPS (not HTTP) in BotFather
- Wait a few minutes for Telegram to sync

## 🛑 Stop ngrok When Done

```bash
Ctrl+C
```

This closes the public tunnel. Your backend and frontend can keep running.

## 🔐 Security Notes

- ngrok creates a **public URL** - anyone can access it
- Perfect for development/testing
- **Don't use in production** (use Railway/Render instead)
- URLs are temporary - change each restart
- Free tier has some rate limits but fine for testing

## 🚀 Next Steps

1. Install ngrok (Step 1)
2. Sign up and get authtoken (Step 2)
3. Start frontend: `cd frontend && npm run dev`
4. Start ngrok: `ngrok http 5173` (in new terminal)
5. Copy ngrok URL
6. Update BotFather with ngrok URL
7. Test in Telegram! 🎉

## 📊 ngrok Web Interface

While ngrok is running, open http://127.0.0.1:4040 to see:
- All requests passing through ngrok
- Request/response details
- Useful for debugging

## Ready to Deploy to Production?

Once you're happy with ngrok testing:
- See **DEPLOY.md** for Railway/Render
- Follow **DEPLOY.md** for production setup
- Don't need ngrok for production!

---

**ngrok is great for:**
✅ Quick local testing
✅ Testing on mobile devices
✅ Demo to others
✅ Before production deployment

**Not for:**
❌ Production apps
❌ Long-term hosting
❌ Private data
