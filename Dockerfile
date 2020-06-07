FROM satantime/puppeteer-node:10-buster-slim

WORKDIR /app
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["sh", "build-with-supported-angluars.sh"]

VOLUME /npm
VOLUME /app/node_modules
VOLUME /app/e2e/angular5/node_modules
VOLUME /app/e2e/angular6/node_modules
VOLUME /app/e2e/angular7/node_modules
VOLUME /app/e2e/angular8/node_modules
VOLUME /app/e2e/angular9-ivy-false/node_modules
VOLUME /app/e2e/angular9-ivy-true/node_modules

RUN npm config set cache /npm --global

COPY ./docker/ /
COPY ./ /app/
