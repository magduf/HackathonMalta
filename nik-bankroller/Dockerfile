FROM mhart/alpine-node:10

RUN apk add --no-cache make gcc g++ python git bash
# RUN yarn global add nodemon babel-cli --ignore-engines --ignore-optional --ignore-platform --link-duplicates

COPY ./ /dapp_server
WORKDIR /dapp_server
# RUN rm -rf node_modules && rm package-lock.json
RUN yarn --production --ignore-engines --ignore-optional --ignore-platform --link-duplicates

ENV PATH="./node_modules/.bin:${PATH}"

ENTRYPOINT ["yarn","start"] 
