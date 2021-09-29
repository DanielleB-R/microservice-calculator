#!/bin/bash

source ./config.sh

aws lambda delete-function --function-name=$ENTRY_LAMBDA_NAME
aws lambda delete-function --function-name=$RESULTS_LAMBDA_NAME
