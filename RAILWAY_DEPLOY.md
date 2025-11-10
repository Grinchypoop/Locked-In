# 🚀 Deploy to Railway (Easiest Option)

Since ngrok has limitations, let's deploy directly to **Railway** - it's free, simple, and takes 5 minutes!

## Step 1: Install Railway CLI

```bash
brew install railway
```

Or download from https://railway.app/

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser. Sign in or create an account (free).

## Step 3: Initialize Railway Project

```bash
# In your Killjoy directory
cd /Users/mehtaz/Killjoy
railway init
```

Follow the prompts:
- Project name: `killjoy`
- Select region (default is fine)

## Step 4: Add PostgreSQL

```bash
railway add
```

Select **PostgreSQL** from the list.

This automatically creates a database and sets environment variables!

## Step 5: Configure Environment Variables

```bash
railway variables set TELEGRAM_BOT_TOKEN=8589879722:AAFOETmPL2BgMI2qi77BCsh6koTBUUn14tg
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-railway-url.railway.app
```

(You'll get the frontend URL after deployment)

## Step 6: Build & Deploy

```bash
npm run build
railway up
```

Wait for it to deploy... ✨

You should see output like:
```
✓ Deployed to https://killjoy-prod.railway.app
```

## Step 7: Update BotFather

1. Message **@BotFather**
2. `/mybots` → Select **Izzylevis_bot**
3. **Bot Settings** → **Menu Button**
4. Update URL to your Railway URL: `https://killjoy-prod.railway.app`
5. Done!

## Step 8: Test

1. Go to your bot in Telegram
2. Click Menu → Open Web App
3. **It should work!** 🎉

---

## Why Railway Over ngrok?

✅ Free tier includes 500 hours/month (plenty!)
✅ Automatic PostgreSQL setup
✅ HTTPS included
✅ No port limits
✅ Works perfectly for this app
✅ Can run both frontend and backend
✅ One-click deployments

## Monitoring

Check your app:

```bash
railway logs
```

View dashboard:

```bash
railway open
```

## Update Your Bot Later

If you redeploy:

```bash
railway up
```

It keeps the same URL!

---

**This is WAY simpler than ngrok. Let's do this instead!** 🚀
