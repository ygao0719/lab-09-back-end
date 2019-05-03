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

CREATE TABLE events(
  id  SERIAL PRIMARY KEY,
  link VARCHAR(255),
  name VARCHAR(255),
  event_date CHAR(15),
  summary VARCHAR(1000),
  created_at BIGINT,
  location_id INTEGER REFERENCES locations(id)
);

CREATE TABLE movies(
  id  SERIAL PRIMARY KEY,
  title VARCHAR(255),  
  overview VARCHAR(255),
  average_votes DECIMAL,
  total_votes INTEGER,
  popularity DECIMAL,
  released_on CHAR(15),
  created_at BIGINT,
  location_id INTEGER REFERENCES locations(id)
);

CREATE TABLE yelp(
  id  SERIAL PRIMARY KEY,
  name VARCHAR(255),  
  image_url VARCHAR(255),
  price CHAR(5),
  rating DECIMAL,
  url VARCHAR(255),
  created_at BIGINT,
  location_id INTEGER REFERENCES locations(id)
);

