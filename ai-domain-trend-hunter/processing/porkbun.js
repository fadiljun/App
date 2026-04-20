require('dotenv').config();

const BASE_URL = 'https://api.porkbun.com/api/json/v3';
const REQUEST_TIMEOUT_MS = 15000;

function creds() {
  const apikey = process.env.PORKBUN_API_KEY;
  const secretapikey = process.env.PORKBUN_SECRET_KEY;
  if (!apikey || !secretapikey) {
    throw new Error(
      'PORKBUN_API_KEY and PORKBUN_SECRET_KEY must be set in .env',
    );
  }
  return { apikey, secretapikey };
}

async function porkbunPost(pathSuffix, extraBody = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${BASE_URL}${pathSuffix}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...creds(), ...extraBody }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`porkbun non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
  if (json.status !== 'SUCCESS') {
    throw new Error(`porkbun: ${json.message || 'unknown error'}`);
  }
  return json;
}

async function ping() {
  return porkbunPost('/ping');
}

function parsePrice(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function checkDomain(domain) {
  const res = await porkbunPost(`/domain/checkDomain/${encodeURIComponent(domain)}`);
  const r = res.response || {};
  return {
    available: r.avail === 'yes',
    price_usd: parsePrice(r.price),
    regular_price_usd: parsePrice(r.regularPrice),
    is_premium: r.premium === 'yes',
    raw: r,
  };
}

function cartUrl(domain) {
  return `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`;
}

module.exports = { ping, checkDomain, cartUrl };
