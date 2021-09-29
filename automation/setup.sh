#!/bin/bash

source ./config.sh

# Create the entry point function
aws lambda create-function \
    --function-name=$ENTRY_LAMBDA_NAME \
    --runtime=nodejs14.x \
    --role=$ENTRY_POINT_ROLE_ARN \
    --environment="Variables={DYNAMO_TABLE=${DYNAMO_TABLE},RESULTS_QUEUE_URL=${RESULTS_QUEUE_URL}}" \
    --zip-file=fileb://$CODE_BUNDLE_PATH \
    --handler=index.entry

# Allow API Gateway to invoke the entry point function
aws lambda add-permission \
    --function-name=$ENTRY_LAMBDA_NAME \
    --statement-id=apigateway-invoke \
    --action=lambda:InvokeFunction \
    --principal=apigateway.amazonaws.com \
    --source-arn=$API_GATEWAY_ARN

# Create the result storage function
aws lambda create-function \
    --function-name=$RESULTS_LAMBDA_NAME \
    --runtime=nodejs14.x \
    --role=$RESULTS_ROLE_ARN \
    --environment="Variables={DYNAMO_TABLE=${DYNAMO_TABLE}}" \
    --zip-file=fileb://$CODE_BUNDLE_PATH \
    --handler=index.storeResult

# Attach the result function to the queue
aws lambda create-event-source-mapping \
    --function-name=$RESULTS_LAMBDA_NAME \
    --event-source-arn=$RESULTS_QUEUE_ARN
