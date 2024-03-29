export ENTRY_LAMBDA_NAME=calculator-entrypoint
export RPN_LAMBDA_NAME=calculator-rpn
export RPN_QUEUE_NAME=calculator-rpn-queue
export RESULTS_LAMBDA_NAME=calculator-store-result
export RESULTS_QUEUE_NAME=calculator-results-queue
export CODE_BUNDLE_PATH=../dist/calculator.zip

export RESULTS_QUEUE_ARN=arn:aws:sqs:${AWS_REGION}:${AWS_ACCOUNT_ID}:${RESULTS_QUEUE_NAME}
export RESULTS_QUEUE_URL=https://sqs.${AWS_REGION}.amazonaws.com/${AWS_ACCOUNT_ID}/${RESULTS_QUEUE_NAME}
export RPN_QUEUE_ARN=arn:aws:sqs:${AWS_REGION}:${AWS_ACCOUNT_ID}:${RPN_QUEUE_NAME}
export RPN_QUEUE_URL=https://sqs.${AWS_REGION}.amazonaws.com/${AWS_ACCOUNT_ID}/${RPN_QUEUE_NAME}
