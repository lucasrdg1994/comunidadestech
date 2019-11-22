import bodyParser from 'body-parser';
import express from 'express';
import next from 'next';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';

import PassportConfig from './helpers/auth/passport';

dotenv.config();

import 'express-async-errors';

import routes from './routes';

// import './models/allocation';

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(`Error: ${err}`);
});

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const COOKIE_SECRET = 'secret';
app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(passport.initialize());
    server.use(passport.session());
    PassportConfig.google();
    PassportConfig.linkedin();

    server.use('/api/v1', routes);
    // server.use((error, req, res, next) => res.status(500).json(error));
    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
