Period typefaces for the Coca-Cola video's signs, labels, handbill, newspaper and the final name (SIL Open Font
License 1.1, from Google Fonts via the @fontsource npm packages, converted from WOFF to TTF with fontTools):
Playfair Display, Abril Fatface, Old Standard TT, Rye, Pinyon Script.
Install them where Chromium's fontconfig finds them before rendering (system fonts also work inside the SVG images
used for transitions; web fonts would not):  mkdir -p ~/.fonts && cp _render/fonts/*.ttf ~/.fonts/ && fc-cache -f
