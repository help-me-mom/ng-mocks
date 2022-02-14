FROM satantime/puppeteer-node:17.5.0-buster

WORKDIR /app
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "e2e:a"]

VOLUME /npm
VOLUME /app/node_modules
VOLUME /app/docs/node_modules
VOLUME /app/e2e/a5es5/node_modules
VOLUME /app/e2e/a5es2015/node_modules
VOLUME /app/e2e/a6/node_modules
VOLUME /app/e2e/a7/node_modules
VOLUME /app/e2e/a8/node_modules
VOLUME /app/e2e/a9/node_modules
VOLUME /app/e2e/a10/node_modules
VOLUME /app/e2e/a11/node_modules
VOLUME /app/e2e/a12/node_modules
VOLUME /app/e2e/a13/node_modules
VOLUME /app/e2e/a14/node_modules
VOLUME /app/e2e/a-jasmine/node_modules
VOLUME /app/e2e/a-jest/node_modules
VOLUME /app/e2e/a-min/node_modules

RUN npm config set cache /npm --global

COPY ./docker/ /
COPY ./ /app/
