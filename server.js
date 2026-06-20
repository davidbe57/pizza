require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tonio2024';

let _supabase = null;

app.use(express.json());

if (process.env.VERCEL !== '1') {
  app.use(express.static(__dirname));
}

// Middleware: inject supabase client into every request
app.use((req, res, next) => {
  if (_supabase) { req.supabase = _supabase; return next(); }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Supabase non configuré (SUPABASE_URL et SUPABASE_ANON_KEY requis)' });
  }
  _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  req.supabase = _supabase;
  next();
});

let validTokens = new Set();

function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

// ─── AUTH ───
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    validTokens.add(token);
    return res.json({ token });
  }
  res.status(401).json({ error: 'Mot de passe incorrect' });
});

app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization;
  if (token) validTokens.delete(token);
  res.json({ ok: true });
});

// ─── MENU ───
app.get('/api/menu', async (req, res) => {
  const { data, error } = await req.supabase.from('menu').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/menu', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('menu').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/menu/:id', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('menu').update(req.body).eq('id', parseInt(req.params.id)).select();
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Pizza introuvable' });
  res.json(data[0]);
});

app.delete('/api/menu/:id', requireAuth, async (req, res) => {
  const { error } = await req.supabase.from('menu').delete().eq('id', parseInt(req.params.id));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── TESTIMONIALS ───
app.get('/api/testimonials', async (req, res) => {
  const { data, error } = await req.supabase.from('testimonials').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/testimonials', requireAuth, async (req, res) => {
  const { author, source, text, stars } = req.body;
  const { data, error } = await req.supabase.from('testimonials').insert({
    author, source: source || '', text, stars: stars || 5,
    date: new Date().toISOString().slice(0, 10)
  }).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/testimonials/:id', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('testimonials').update(req.body).eq('id', parseInt(req.params.id)).select();
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Avis introuvable' });
  res.json(data[0]);
});

app.delete('/api/testimonials/:id', requireAuth, async (req, res) => {
  const { error } = await req.supabase.from('testimonials').delete().eq('id', parseInt(req.params.id));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── ORDERS ───
app.get('/api/orders', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('orders').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/orders', async (req, res) => {
  const { data: orders, error: ordersErr } = await req.supabase.from('orders').select('*');
  if (ordersErr) return res.status(500).json({ error: ordersErr.message });

  const { data: settings, error: setErr } = await req.supabase.from('settings').select('*').eq('key', 'maxPizzasPerSlot').single();
  if (setErr && setErr.code !== 'PGRST116') return res.status(500).json({ error: setErr.message });

  const { data: slotOverrides, error: slotErr } = await req.supabase.from('slot_settings').select('*');
  if (slotErr) return res.status(500).json({ error: slotErr.message });

  const now = new Date();
  const todayKey = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][now.getDay()];
  const dayOverrides = {};
  slotOverrides.filter(s => s.jour === todayKey && s.slot_time).forEach(s => { dayOverrides[s.slot_time] = s.max_pizzas; });

  const defaultMax = settings ? (typeof settings.value === 'number' ? settings.value : parseInt(settings.value) || 5) : 5;

  function countPizzas(commande) {
    return (commande.match(/(\d+)\s*x?/gi) || []).reduce((sum, m) => sum + parseInt(m), 0) || 1;
  }

  const max = dayOverrides[req.body.slot] ?? defaultMax;
  const slotOrders = orders.filter(o => o.slot === req.body.slot && o.status !== 'Terminée');
  const currentTotal = slotOrders.reduce((sum, o) => sum + countPizzas(o.commande), 0);
  const incomingQty = countPizzas(req.body.commande);

  if (currentTotal + incomingQty > max) {
    return res.status(409).json({ error: `Capacité dépassée pour le créneau ${req.body.slot} : ${currentTotal}/${max} déjà réservé${currentTotal > 1 ? 's' : ''}, vous demandez ${incomingQty}.` });
  }

  const order = {
    id: Date.now(),
    date: new Date().toLocaleString('fr-FR'),
    name: req.body.name,
    phone: req.body.phone,
    commande: req.body.commande,
    slot: req.body.slot,
    type: 'emporter',
    horaire: req.body.horaire || '',
    status: 'Nouveau'
  };

  const { data, error } = await req.supabase.from('orders').insert(order).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/orders/:id', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase.from('orders').update(req.body).eq('id', parseInt(req.params.id)).select();
  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Commande introuvable' });
  res.json(data[0]);
});

app.delete('/api/orders/:id', requireAuth, async (req, res) => {
  const { error } = await req.supabase.from('orders').delete().eq('id', parseInt(req.params.id));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── AVAILABILITY (public) ───
app.get('/api/slots', async (req, res) => {
  const { data: orders, error: ordersErr } = await req.supabase.from('orders').select('*');
  if (ordersErr) return res.status(500).json({ error: ordersErr.message });

  const { data: hours, error: hoursErr } = await req.supabase.from('hours').select('*');
  if (hoursErr) return res.status(500).json({ error: hoursErr.message });

  const { data: settings, error: setErr } = await req.supabase.from('settings').select('*').eq('key', 'maxPizzasPerSlot').single();
  if (setErr && setErr.code !== 'PGRST116') return res.status(500).json({ error: setErr.message });

  const { data: slotOverrides, error: slotErr } = await req.supabase.from('slot_settings').select('*');
  if (slotErr) return res.status(500).json({ error: slotErr.message });

  const defaultMax = settings ? (typeof settings.value === 'number' ? settings.value : parseInt(settings.value) || 5) : 5;
  const now = new Date();
  const todayKey = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][now.getDay()];
  const today = hours.find(h => h.jour === todayKey);
  const dayOverrides = {};
  slotOverrides.filter(s => s.jour === todayKey && s.slot_time).forEach(s => { dayOverrides[s.slot_time] = s.max_pizzas; });

  if (!today || today.ferme) return res.json({ slots: [], ferme: true });

  function parseTime(str) {
    const clean = str.replace(/[^\d:]/g, '');
    const [h, m] = clean.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  function formatSlot(minutes) {
    return `${Math.floor(minutes / 60)}h${(minutes % 60) ? (minutes % 60).toString().padStart(2, '0') : ''}`;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slots = [];

  function splitHours(v) {
    const parts = v.split('–').length > 1 ? v.split('–') : v.split(' - ');
    return parts.map(s => parseTime(s.trim()));
  }
  const midi = today.midi && (today.midi.includes('–') || today.midi.includes(' - ')) ? splitHours(today.midi) : null;
  const soir = today.soir && (today.soir.includes('–') || today.soir.includes(' - ')) ? splitHours(today.soir) : null;
  const ranges = [];
  if (midi && midi.length === 2) ranges.push([midi[0] - 15, midi[1]]);
  if (soir && soir.length === 2) ranges.push([soir[0] - 15, soir[1]]);

  function countPizzas(commande) {
    return (commande.match(/(\d+)\s*x?/gi) || []).reduce((sum, m) => sum + parseInt(m), 0) || 1;
  }

  for (const [start, end] of ranges) {
    for (let t = start; t < end; t += 15) {
      if (t < currentMinutes + 45) continue;
      const slot = formatSlot(t);
      const max = dayOverrides[slot] ?? defaultMax;
      const slotOrders = orders.filter(o => o.slot === slot && o.status !== 'Terminée');
      const totalPizzas = slotOrders.reduce((sum, o) => sum + countPizzas(o.commande), 0);
      slots.push({
        value: slot,
        remaining: Math.max(0, max - totalPizzas),
        max,
        disponible: totalPizzas < max
      });
    }
  }

  res.json({ slots, ferme: false, defaultMax });
});

// ─── SLOT SETTINGS ───
app.get('/api/slotSettings', async (req, res) => {
  const { data, error } = await req.supabase.from('slot_settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const grouped = { lundi: {}, mardi: {}, mercredi: {}, jeudi: {}, vendredi: {}, samedi: {}, dimanche: {} };
  data.forEach(s => {
    if (s.slot_time) grouped[s.jour][s.slot_time] = s.max_pizzas;
  });
  res.json(grouped);
});

app.put('/api/slotSettings', requireAuth, async (req, res) => {
  const { data: existing } = await req.supabase.from('slot_settings').select('id, jour, slot_time');
  const seen = new Set();
  const inserts = [];
  for (const [jour, overrides] of Object.entries(req.body)) {
    for (const [slot_time, max_pizzas] of Object.entries(overrides)) {
      inserts.push({ jour, slot_time, max_pizzas });
      seen.add(`${jour}:${slot_time}`);
    }
  }
  // Delete removed entries
  for (const row of existing || []) {
    if (row.slot_time && !seen.has(`${row.jour}:${row.slot_time}`)) {
      await req.supabase.from('slot_settings').delete().eq('id', row.id);
    }
  }
  // Upsert new ones
  for (const ins of inserts) {
    const { data: existingRow } = await req.supabase.from('slot_settings').select('id').eq('jour', ins.jour).eq('slot_time', ins.slot_time).maybeSingle();
    if (existingRow) {
      await req.supabase.from('slot_settings').update(ins).eq('id', existingRow.id);
    } else {
      await req.supabase.from('slot_settings').insert(ins);
    }
  }
  res.json({ ok: true });
});

// ─── SETTINGS ───
app.get('/api/settings', async (req, res) => {
  const { data, error } = await req.supabase.from('settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const obj = {};
  data.forEach(s => { obj[s.key] = s.value; });
  res.json(obj);
});

app.put('/api/settings', requireAuth, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    const { data: existing } = await req.supabase.from('settings').select('id').eq('key', key).maybeSingle();
    if (existing) {
      await req.supabase.from('settings').update({ value }).eq('id', existing.id);
    } else {
      await req.supabase.from('settings').insert({ key, value });
    }
  }
  res.json(req.body);
});

// ─── HOURS ───
app.get('/api/hours', async (req, res) => {
  const { data, error } = await req.supabase.from('hours').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  const obj = {};
  data.forEach(h => { obj[h.jour] = { midi: h.midi, soir: h.soir, ferme: h.ferme }; });
  res.json(obj);
});

app.put('/api/hours', requireAuth, async (req, res) => {
  for (const [jour, h] of Object.entries(req.body)) {
    const { data: existing } = await req.supabase.from('hours').select('id').eq('jour', jour).maybeSingle();
    if (existing) {
      await req.supabase.from('hours').update({ midi: h.midi, soir: h.soir, ferme: h.ferme }).eq('id', existing.id);
    } else {
      await req.supabase.from('hours').insert({ jour, midi: h.midi, soir: h.soir, ferme: h.ferme });
    }
  }
  res.json(req.body);
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Casa Tonio - http://localhost:${PORT}`);
    console.log(`Admin - http://localhost:${PORT}/admin/`);
  });
}

module.exports = app;
