// Direct Supabase REST client — no supabase-js dependency.
// Avoids Authorization Bearer issues with sb_publishable_ key format.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const BASE = SUPABASE_URL + '/rest/v1';
const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  'Accept': 'application/json',
};

class QueryBuilder {
  constructor(table) {
    this._table = table;
    this._select = '*';
    this._filters = [];
    this._orders = [];
    this._limit = null;
    this._count = false;
  }
  select(cols) { this._select = cols; return this; }
  eq(col, val) { this._filters.push(`${col}=eq.${encodeURIComponent(val)}`); return this; }
  order(col, opts = {}) {
    this._orders.push(`${col}.${opts.ascending === false ? 'desc' : 'asc'}`);
    return this;
  }
  limit(n) { this._limit = n; return this; }
  // Thenable — resolves as { data, error }
  then(resolve, reject) {
    const parts = [`select=${encodeURIComponent(this._select)}`];
    this._filters.forEach(f => parts.push(f));
    if (this._orders.length) parts.push(`order=${this._orders.join(',')}`);
    if (this._limit !== null) parts.push(`limit=${this._limit}`);
    const url = `${BASE}/${this._table}?${parts.join('&')}`;
    fetch(url, { headers: HEADERS })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(`${res.status}: ${t}`); });
        return res.json();
      })
      .then(data => resolve({ data, error: null }))
      .catch(e => resolve({ data: null, error: e }));
  }
}

export const supabase = {
  from(table) { return new QueryBuilder(table); }
};
