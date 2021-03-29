FROM python:3.8.3

EXPOSE 5000

WORKDIR /tagging_service

COPY . /tagging_service

RUN pip install -r requirements.txt

CMD flask run --host=0.0.0.0
