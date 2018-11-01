#!/bin/bash

set -ex

ACCOUNT="alexstep"
IMAGE_NAME="voicegame_v1"
TAG="v_1.0.1" # first arg is tag

docker build -t ${ACCOUNT}/${IMAGE_NAME}:${TAG} -t ${ACCOUNT}/${IMAGE_NAME}:latest .
docker push ${ACCOUNT}/${IMAGE_NAME}
