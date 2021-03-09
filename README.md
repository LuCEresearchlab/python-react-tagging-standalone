# python-react-tagging-standalone

## Description

Standalone web-application aimed at tagging students answers with misconceptions from 
https://progmiscon.org/misconceptions

The application aims at improving the efficiency of tagging students answers by providing aids in the tagging procedure,
this will allow for a more scalable tagging experience.

## Project Structure
- frontend: React Typescript application
- model: models of the project
- mongodb: Dockerfile for MongoDB server
- tagging service: Python Flask server


## Usage
The application is entirely dockerized and as such can be run as long as Docker is installed, to run it:
```
cd python-react-tagging-standalone
docker-compose up
```
then connect to http://localhost:8080/

To stop the containers
```
docker-compose down
```

In case there are issues due to dependencies try to rebuild the containers (will wipe tagged data) with
```
docker-compose up --build  # rebuil
```

## Convert data from LUMI to required data format
Create python local environment if not existing
```
python3 -m venv venv
```

Setup python local environment for conversion
```
source venv/bin/activate
cd scripts
pip install -r requirements.txt
```

Run with
```
python3 converter.py <your-file>.xlsx <quiz-session-file>.json
```
A new file `<your-file>.json` will appear.


## Connect to a specific container

The host can connect to the various containers at the following addresses
- frontend: http://localhost:8080/
- tagging service:   http://localhost:5000/
- MongoDB database:     http://localhost:27017/

Note:
We can see the available endpoints of the tagging service by connecting directly to its container http://localhost:5000/


## Testing

### Set-up local environment
To test the application it is required to set up a local development environment, to do so run
```
cd frontend
npm ci install
cd ..
python3 -m venv venv
source venv/bin/activate
cd tagging-service
pip install -r requirements.txt
```

### Frontend testing
```
cd frontend
npm test
```

### Service testing
```
pytest
```
