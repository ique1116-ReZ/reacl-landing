# ReACL landing page source

React / Vite source for the website at https://reacl.cn/.

## Develop

```sh
npm ci
npm run dev
```

The website uses warm paper artwork, transparent crayon lettering, seven ordered stage cards, genuine native iPhone screenshots, and six original literature covers. The comparison includes the seven currently available features; specialized training was removed.

## Build and release

```sh
npm run build
npm run test:sites
node scripts/stage-production.mjs
```

The build creates a complete prerendered static page in `dist/client`, with React hydration for interactions. The staging script copies that static output to the repository root, preserving the existing GitHub Pages `main` / root deployment and CNAME. It does not commit or push. Review the diff before committing and pushing `main`.

## Assets

`public/assets` contains optimized web resources. Native App screenshots are lossless WebP encodings of actual iPhone simulator screenshots from ReACL 6.0/build 1. Today and progress use an offline example account, not patient outcomes; exercise detail uses existing catalog metadata and its original animation. The 3D video is a native SceneKit recording with the actual Chinese exercise name. Screens are not generated or redrawn. Raw capture material and original images are deliberately excluded from this repository.

The iPhone 17 Pro Silver hardware frame is from [Hoverify](https://tryhoverify.com/tools/device-frames/iphone-17-pro/), under its [device-frame license](https://tryhoverify.com/tools/device-frames/license/). The hero is external brand illustration without fabricated App UI or assessment data. Crayon feature illustrations come from the App's existing assets; literature covers, QR codes, logo and music are retained from the original website.
