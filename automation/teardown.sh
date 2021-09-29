#!/bin/bash

source ./config.sh

aws lambda delete-function --function-name=$ENTRY_LAMBDA_NAME
aws lambda delete-function --function-name=$RESULTS_LAMBDA_NAME
aws sqs delete-queue --queue-url=$RESULTS_QUEUE_URL

## NOTE: This does not delete the queue-function event mapping since they're referred to by UUID; they must be deleted manually when tearing down
