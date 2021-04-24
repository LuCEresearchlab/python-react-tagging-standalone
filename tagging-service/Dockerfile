FROM python:3.8.3

EXPOSE 5000

WORKDIR /tagging_service

COPY . /tagging_service

RUN pip install -r requirements.txt

CMD gunicorn --preload --workers $NR_WORKERS --reload --timeout 90 -b 0.0.0.0:5000 flaskr:my_app
