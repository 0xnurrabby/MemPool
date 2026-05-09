<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,17,24&height=180&section=header&text=MemPool+Galaxy&fontSize=48&fontColor=000000&fontAlignY=38&desc=Visualize+your+Farcaster+social+circle+as+a+blockchain+node+network&descAlignY=58&descSize=14&animation=fadeIn" width="100%"/>

<div align="center">

[![Live](https://img.shields.io/badge/Live%20App-bbf7d0?style=for-the-badge&logoColor=000)](https://mem-pool.vercel.app)
[![License](https://img.shields.io/badge/MIT-bfdbfe?style=for-the-badge&logoColor=000)](LICENSE)
[![Platform](https://img.shields.io/badge/Farcaster%20Mini%20App-fde68a?style=for-the-badge&logoColor=000)]()
[![Tech](https://img.shields.io/badge/JavaScript%20%2B%20Canvas-fca5a5?style=for-the-badge&logoColor=000)]()

</div>

<div align="center">
<i>See your Farcaster followers and following rendered as glowing blockchain nodes in a live galaxy visualization, connected by interaction edges.</i>
</div>

---

## ✦ Features

<div align="center">

| | Feature | What it does |
|:---:|---|---|
| 🌌 | Galaxy visualization | Renders your Farcaster social graph as animated nodes in space |
| 🔗 | Node network | Followers and following shown as connected blockchain-style nodes |
| ✨ | Glowing UI | Neon cyan and purple glow theme with dark space background |
| 📱 | Farcaster native | Runs inside Warpcast / Base app as a mini app |
| 🔭 | Interactive | Click and explore nodes in your social galaxy |

</div>

---

## ✦ Download & Run

**Step 1** .... Clone the repo

```bash
git clone https://github.com/0xnurrabby/MemPool
cd MemPool
```

**Step 2** .... Serve the public folder

```bash
# Open directly
cd public
start index.html

# Or use a local server
npx serve public
# Open http://localhost:3000
```

**Step 3** .... Connect your Farcaster account to visualize your network

---

## ✦ Setup

```
1. Clone the repo
2. Navigate to the public/ folder
3. Open index.html in a browser
4. For Farcaster sign-in: use inside Warpcast or Base app
   (SIWF only works inside a Farcaster client)
5. To deploy: push to Vercel
   Serves the public/ folder as a static site
```

---

## ✦ Project Structure

```
MemPool/
  public/
    index.html             ->  entry point with Farcaster mini app meta
    script.js              ->  galaxy rendering, Farcaster graph fetching
    mempool-galaxy-ui.js   ->  UI components and node layout
    assets/                ->  icons, splash, embed images
    .well-known/           ->  Farcaster app manifest
```

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,17,24&height=100&section=footer&animation=fadeIn" width="100%"/>

<div align="center">MIT License .... built by <a href="https://github.com/0xnurrabby">0xnurrabby</a></div>
