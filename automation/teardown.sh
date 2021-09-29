#!/bin/bash

source ./config.sh

aws lambda delete-function --function-name=$ENTRY_LAMBDA_NAME
aws lambda delete-function --function-name=$RPN_LAMBDA_NAME
aws lambda delete-function --function-name=$RESULTS_LAMBDA_NAME
aws sqs delete-queue --queue-url=$RESULTS_QUEUE_URL
aws sqs delete-queue --queue-url=$RPN_QUEUE_URL

resultsMappingUuid=$(aws lambda list-event-source-mappings --function-name=${RESULTS_LAMBDA_NAME} | jq -r .EventSourceMappings[0].UUID)
aws lambda delete-event-source-mapping --uuid=$resultsMappingUuid

rpnMappingUuid=$(aws lambda list-event-source-mappings --function-name=${RPN_LAMBDA_NAME} | jq -r .EventSourceMappings[0].UUID)
aws lambda delete-event-source-mapping --uuid=$rpnMappingUuid
