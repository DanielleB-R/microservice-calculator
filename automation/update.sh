#!/bin/bash

source ./config.sh

aws lambda --no-cli-pager update-function-code \
    --function-name=$ENTRY_LAMBDA_NAME \
    --zip-file=fileb://$CODE_BUNDLE_PATH

aws lambda --no-cli-pager update-function-code \
    --function-name=$RPN_LAMBDA_NAME \
    --zip-file=fileb://$CODE_BUNDLE_PATH

aws lambda --no-cli-pager update-function-code \
    --function-name=$RESULTS_LAMBDA_NAME \
    --zip-file=fileb://$CODE_BUNDLE_PATH
