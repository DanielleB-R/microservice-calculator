#!/bin/bash

source ./config.sh

aws lambda update-function-code \
    --function-name=$ENTRY_LAMBDA_NAME \
    --zip-file=fileb://$CODE_BUNDLE_PATH

aws lambda update-function-code \
    --function-name=$RESULTS_LAMBDA_NAME \
    --zip-file=fileb://$CODE_BUNDLE_PATH
