const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '../language.js'), 'utf8');
const origin = 'https://kolbanidze.github.io';

function visit(route, storage, locale = 'ru-RU') {
  let current = new URL(route, origin);
  vm.runInNewContext(source, {
    URL,
    document: { documentElement: { lang: current.pathname === '/ru/' ? 'ru' : 'en' } },
    navigator: { language: locale },
    localStorage: storage,
    location: { href: current.href, replace: url => { current = url; } },
    history: { replaceState: (_, __, url) => { current = url; } },
  });
  return current.pathname + current.search + current.hash;
}

test('language links override detection and retain the choice on later visits', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (k, v) => values.set(k, v) };
  assert.equal(visit('/#download', storage), '/ru/#download');
  assert.equal(visit('/?lang=en', storage), '/');
  assert.equal(visit('/', storage), '/');
  assert.equal(visit('/ru/?lang=ru', storage), '/ru/');
  assert.equal(visit('/', storage, 'en-US'), '/ru/');
});

test('legacy and storage-blocked visitors can open English', () => {
  assert.equal(visit('/', { getItem: k => k === 'lang-override' ? 'true' : null }), '/');
  const blocked = { setItem() { throw new Error('Storage disabled'); } };
  assert.equal(visit('/?lang=en', blocked), '/?lang=en');
});
