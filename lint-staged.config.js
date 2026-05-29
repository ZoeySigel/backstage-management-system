export default {
  '*.{js,cjs,mjs,ts,vue}': 'eslint --fix',
  '*.{css,scss,vue}': 'stylelint --fix',
  '*.{js,cjs,mjs,ts,vue,css,scss,json,md,yml,yaml,html}': 'prettier --write',
}
