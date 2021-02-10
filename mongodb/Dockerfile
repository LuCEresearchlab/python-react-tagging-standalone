FROM mongo:3.6.21-xenial
COPY misconceptions.json /init.json
CMD mongoimport --host mongo_database --db tagging_db --collection misconceptions --type json --file /init.json --jsonArray