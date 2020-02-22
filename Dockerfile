FROM satantime/puppeteer-node:10

ENV WITH_PUPPETEER 1

WORKDIR /app
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["sh", "build-with-supported-angluars.sh"]

COPY ./docker/ /
COPY ./ /app/
