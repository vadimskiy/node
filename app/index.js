const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const port = 3000;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
});

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.post('/users', (req, res, next) => {
    const user = req.body;
    
    pool.connect((err, client, done) => {
        if (err) {
        // Передача ошибки в обработчик express
            return next(err);
        }

        client.query('INSERT INTO users (name, age) VALUES ($1, $2);', [user.name, user.age], function (err, result) {
            done(); // Этот коллбек сигнализирует драйверу pg, что соединение может быть закрыто или возвращено в пул соединений

            if (err) {
            // Передача ошибки в обработчик express
                return next(err);
            }

            res.send(200);
        });
    });
});

app.get('/users', (req, res, next) => {
    pool.connect((err, client, done) => {
      if (err) {
        // Передача ошибки в обработчик express
        return next(err);
      }

      client.query('SELECT name, age FROM users;', [], function (err, result) {
        done();

        if (err) {
          // Передача ошибки в обработчик express
          return next(err);
        }

        res.json(result.rows);
      });
    });
  });

app.get('/', (request, response) => {
    response.render('home', {
        name: 'Evgeniya'
    });
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});