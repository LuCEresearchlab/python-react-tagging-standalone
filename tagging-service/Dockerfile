FROM python:3.9.1-slim

EXPOSE 5000

WORKDIR /tagging_service

COPY . /tagging_service

RUN pip install -r requirements.txt

CMD ["python", "src/main.py"]