import ejs from "ejs-lite/lib/ejs.min.js"; // versão pura sem 'fs'

export default function renderEjs(template, data) {
  return ejs.render(template, data);
}