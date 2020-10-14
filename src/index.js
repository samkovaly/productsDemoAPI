
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import routes from './routes';
import { sequelize } from './models';
 

const app = express();


// CORS: It shouldn't be possible to access web data from other domains
// all routes are accessible for all domains now. (application level middleware)
// should use whitelist later
app.use(cors());


// recognize input POST data as JSON
app.use(express.json());
// urlencoded parses x-ww-form-urlencoded request bodies
app.use(express.urlencoded({ extended: true }))
// both make req.body reachable


app.use('/api/products', routes.products)


const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(() => {
    app.listen(process.env.APP_PORT, console.log('Listening on port ' + process.env.APP_PORT))
})