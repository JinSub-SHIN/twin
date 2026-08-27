# 살짝

월세 나누고 같이 살 사람을 찾는 반응형 웹뷰 앱 (Vite + React + TypeScript + shadcn/ui)

## 시작하기

```bash
npm install
npm run dev
```

## 스택

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui (`nova` preset)
- react-router-dom

## 스크립트

- `npm run dev` — 개발 서버 (`http://localhost:5173`)
- `npm run build` — 프로덕션 빌드
- `npm run preview` — 빌드 미리보기

## 구조

```
src/
  components/
    ui/           # shadcn 컴포넌트
    Header.tsx
    BottomNav.tsx
  layouts/        # AppLayout (모바일 웹뷰 셸)
  pages/          # Home, Explore, Profile
  lib/utils.ts
```

## 컴포넌트 추가

```bash
npx shadcn@latest add [component]
```
