FROM python:3.9-slim
RUN apt-get update && apt-get install -y time
WORKDIR /app
COPY run_python.sh .
CMD ["/app/run_python.sh"]