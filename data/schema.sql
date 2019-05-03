DROP TABLE IF EXISTS weathers, events, movies, yelp, locations;


CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL,
  longitude DECIMAL,
  formatted_query VARCHAR(255),
  search_query VARCHAR(255)
);

CREATE TABLE weathers (
  forecast VARCHAR(255),
  time CHAR(15),
  created_at BIGINT,
  location_id INTEGER REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS events(
  id  SERIAL PRIMARY KEY,
  link VARCHAR(255),
  name VARCHAR(255),
  event_date CHAR(15),
  summary VARCHAR(1000),
  location_id INTEGER REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS movies(
  id  SERIAL PRIMARY KEY,
  title VARCHAR(255),  
  overview VARCHAR(255),
  average_votes DECIMAL,
  total_votes INTEGER,
  popularity DECIMAL,
  released_on CHAR(15),
  location_id INTEGER REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS yelp(
  id  SERIAL PRIMARY KEY,
  name VARCHAR(255),  
  image_url VARCHAR(255),
  price CHAR(5),
  rating DECIMAL,
  URL VARCHAR(255),
  location_id INTEGER REFERENCES locations(id)
);



