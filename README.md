# ஸ்ரீநிவாசா Tour Operators

Premium travel agency website built with React + TypeScript + Tailwind CSS.

## 🚀 Deploy to Vercel

### Option 1: GitHub (Recommended)
1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click **"Add New Project"**
4. Import your GitHub repo
5. Vercel auto-detects Vite — click **Deploy**
6. Done! Your site is live.

### Option 2: Direct Upload
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Click **"Continue with GitHub"** or drag & drop the project folder
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**

### Option 3: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## 📦 Local Development

```bash
npm install
npm run dev
npm run build
```

## 🛠 Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- React Router DOM (routing)
- Lucide React (icons)

## 📁 Project Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── ServicesSection.tsx
│   ├── FeaturedPackages.tsx
│   ├── WhyChooseUs.tsx
│   ├── Testimonials.tsx
│   ├── CTABanner.tsx
│   ├── FloatingButtons.tsx
│   └── ScrollToTop.tsx
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Packages.tsx
│   ├── PackageDetail.tsx
│   ├── Gallery.tsx
│   └── Contact.tsx
├── data/
│   └── packages.ts
public/
├── favicon.svg
├── images/
└── videos/
```
