const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');
const { formatFontList } = require('./munging.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/api/favorites', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT * from favorites
      WHERE user_id=$1`,
    [req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/detail/:name', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT * from favorites
      WHERE name=$1`,
    [req.params.name]);

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/api/favorites', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO favorites (
      name, 
      link, 
      category, 
      variants, 
      subsets, 
      user_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;`,
    [
      req.body.name, 
      req.body.link, 
      req.body.category, 
      req.body.variants, 
      req.body.subsets, 
      req.userId
    ]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/favorites/:name', async(req, res) => {
  try {
    const data = await client.query(`
      DELETE FROM favorites
      WHERE user_id=$1 AND name=$2`,
    [req.userId, req.params.name]);

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/fonts', async(req, res) => {
  try {
    const fontData = await request.get(`https://www.googleapis.com/webfonts/v1/webfonts?sort=${req.query.sort}&key=${process.env.GOOGLE_FONT_KEY}`);

    const shapedResponse = formatFontList(fontData.body);

    res.json(shapedResponse);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT * from categories`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
