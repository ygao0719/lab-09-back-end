'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

// API Routes
app.get('/location', (request, response) => {
  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => handleError(error, response));
});

app.get('/weather', getWeather);
app.get('/events', getEvents);
//app.get('/movies',getMovies);

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

// Models
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Event(event) {
  this.link = event.url;
  this.name = event.name.text;
  this.event_date = new Date(event.start.local).toDateString();
  this.summary = event.summary;
}

function searchToLatLong(query) {
  // check if query in database
  let sqlStatement = 'SELECT * FROM location WHERE search_query = $1;';
  let values = [ query ];
  return client.query(sqlStatement, values)
    .then( (data) => {
      // if data in db, use data from db and send result
      if(data.rowCount > 0) {
        // use data from db and send result
        console.log('we are sending data from the database');
        return data.rows[0];
      } else {
        // otherwise, grab data from gmaps, save to db, and send result
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        console.log(url);
        return superagent.get(url)
          .then(res => {
            let newLocation = new Location(query, res);
            let insertStatement = 'INSERT INTO location ( search_query, formatted_query, latitude, longitude ) VALUES ( $1, $2, $3, $4 ) RETURNING id;';
            let insertValues = [ newLocation.search_query, newLocation.formatted_query, newLocation.latitude, newLocation.longitude ];
            client.query(insertStatement, insertValues)
              .then (pgResponse => {
                newLocation.id = pgResponse.rows[0].id;
                return newLocation;
              });
          })
          .catch(error => handleError(error));
      }
    });
}

let weatherTimeout = 15 * 1000;
function getWeather(request, response) {
  getData('weather', request, response);
}

let timeouts = {
  weather: 15 * 1000
};

let dataFreshFunctions = {
  weather: getFreshWeatherData
};

function getData(tableName, request, response) {
  let sqlStatement = `SELECT * FROM ${tableName} WHERE location_id = $1;`;
  let values = [ request.query.data.id ];
  client.query(sqlStatement, values)
    .then( (data) => {
      if (data.rowCount > 0) {
        // we got weather data from our database
        // check if the data is fresh
        let dataCreatedTime = data.rows[0].created_at;
        let now = Date.now();
        if (now - dataCreatedTime > timeouts[tableName]) {
          // delete old data from the database
          let deleteStatement = `DELETE FROM ${tableName} WHERE location_id = $1`;
          client.query(deleteStatement, values)
            .then( () => {
              // get fresh data
              dataFreshFunctions[tableName](request, response);
            });
        } else {
          response.send(data.rows);
        }
      } else {
        dataFreshFunctions[tableName](request, response);
      }
    });

}

//

function getFreshWeatherData(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then(result => {
      const weatherSummaries = result.body.daily.data.map(day => {
        let newWeather =  new Weather(day);
        let insertStatement = 'INSERT INTO weather (forecast, time, created_at, location_id) VALUES ( $1, $2, $3, $4 );';
        let values = [newWeather.forecast, newWeather.time, Date.now(), request.query.data.id ];
        client.query(insertStatement, values);
        return newWeather;
      });
      response.send(weatherSummaries);
    })
    .catch(error => handleError(error, response));

}


function getEvents(request, response) {
  const url = `https://www.eventbriteapi.com/v3/events/search?location.address=${request.query.data.formatted_query}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.EVENTBRITE_KEY}`)
    .then(result => {
      const events = result.body.events.map(eventData => {
        const event = new Event(eventData);
        return event;
      });

      response.send(events);
    })
    .catch(error => handleError(error, response));
}

// function getMovies(request, response) {
//   // console.log(request);
//   const url = `https://api.themoviedb.org/3/search/movies?api_key${process.env.MOVIE_API_KEY}&query=${request.query.data.search_query}`;
//   superagent.get(url)
//     .then(result => {
//       console.log(result.body);
//       // const events = result.body.events.map(eventData => {
//       //   const event = new Event(eventData);
//       //   return event;
//     })
//     .catch(error => handleError(error, response));

//   // response.send(events);
// }

// }
