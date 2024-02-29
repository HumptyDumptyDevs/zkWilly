

### Fetch Blocks Lambda

resource "aws_cloudwatch_event_rule" "fetch_blocks_eventbridge_trigger" {
  name                = "${var.project}-${var.env}-fetch-blocks-trigger"
  schedule_expression = "rate(1 minute)" # every minute
  description         = "Triggers ${var.project}-${var.env}-fetch-blocks every 60 seconds"
}

resource "aws_cloudwatch_event_target" "fetch_blocks_eventbridge" {
  rule      = aws_cloudwatch_event_rule.fetch_blocks_eventbridge_trigger.name
  target_id = "${var.project}-${var.env}-fetch-blocks"
  arn       =  aws_lambda_function.fetch_blocks.arn
}

resource "aws_lambda_permission" "fetch_blocks_eventbridge" {
  statement_id = "AllowExecutionFromEventBridge"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fetch_blocks.arn
  principal = "events.amazonaws.com"
  source_arn = aws_cloudwatch_event_rule.fetch_blocks_eventbridge_trigger.arn
}

resource "aws_lambda_function" "fetch_blocks" {
  function_name = "${var.project}-${var.env}-fetch-blocks"
  timeout       = 15 # seconds
  image_uri     = "${aws_ecr_repository.repos["zkwilly-dev-fetch-blocks"].repository_url}:latest"
  package_type  = "Image"

  role = aws_iam_role.fetch_blocks.arn

  environment {
    variables = {
      environment = var.env
    }
  }
}

resource "aws_iam_role" "fetch_blocks" {
  name = "${var.project}-${var.env}-fetch-blocks"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = ["lambda.amazonaws.com", "events.amazonaws.com"] 
        }
      }
    ]
  })
}

resource "aws_iam_policy" "fetch_blocks" {
  name = "${var.project}-${var.env}-fetch-blocks-s3"

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject"
        ],
        "Resource": [
          "arn:aws:s3:::${var.project}-${var.env}-fetch-blocks/*" 
        ]
      }
    ]
  })
}

# Attach the Policy to the Lambda Role
resource "aws_iam_role_policy_attachment" "fetch_blocks" {
  role       = aws_iam_role.fetch_blocks.name 
  policy_arn = aws_iam_policy.fetch_blocks.arn 
}


# Attach the AWSLambdaBasicExecutionRole to the Lambda Role
resource "aws_iam_role_policy_attachment" "fetch_blocks_lambda_basic_execution" {
  role       = aws_iam_role.fetch_blocks.name 
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


### Fetch Transactions Lambda

resource "aws_lambda_function" "fetch_transactions" {
  function_name = "${var.project}-${var.env}-fetch-transactions"
  timeout       = 60 # seconds
  image_uri     = "${aws_ecr_repository.repos["zkwilly-dev-fetch-transactions"].repository_url}:latest"
  package_type  = "Image"

  role = aws_iam_role.fetch_transactions.arn

  environment {
    variables = {
      environment = var.env
    }
  }
}

resource "aws_iam_role" "fetch_transactions" {
  name = "${var.project}-${var.env}-fetch-transactions"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "fetch_transactions" {
  name = "${var.project}-${var.env}-fetch-transactions-s3"

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject"
        ],
        "Resource": [
          "arn:aws:s3:::${var.project}-${var.env}-fetch-blocks/*" 
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject"
        ],
        "Resource": [
          "arn:aws:s3:::${var.project}-${var.env}-fetch-transactions/*" 
        ]
      }
    ]
  })
}

# Attach the Policy to the Lambda Role
resource "aws_iam_role_policy_attachment" "fetch_transactions" {
  role       = aws_iam_role.fetch_transactions.name 
  policy_arn = aws_iam_policy.fetch_transactions.arn 
}

# Attach the AWSLambdaBasicExecutionRole to the Lambda Role
resource "aws_iam_role_policy_attachment" "fetch_transactions_lambda_basic_execution" {
  role       = aws_iam_role.fetch_transactions.name 
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


### Process Transactions Lambda

data "aws_secretsmanager_secret_version" "env" {
  secret_id = "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:${var.project}-${var.env}-secrets-wJPWb2"
}

resource "aws_lambda_function" "process_transactions" {
  function_name = "${var.project}-${var.env}-process-transactions"
  timeout       = 60 # seconds
  image_uri     = "${aws_ecr_repository.repos["zkwilly-dev-process-transactions"].repository_url}:latest"
  package_type  = "Image"

  role = aws_iam_role.process_transactions.arn

  environment {
    variables = merge(
      { environment = var.env },
      jsondecode(data.aws_secretsmanager_secret_version.env.secret_string)
    )
  }
}

resource "aws_iam_role" "process_transactions" {
  name = "${var.project}-${var.env}-process-transactions"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "process_transactions" {
  name = "${var.project}-${var.env}-process-transactions-s3"

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
        ],
        "Resource": [
          "arn:aws:s3:::${var.project}-${var.env}-fetch-transactions/*" 
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue"
        ],
        "Resource": [
          "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:${var.project}-${var.env}-secrets-wJPWb2/*"
        ]
      }
    ]
  })
}

# Attach the Policy to the Lambda Role
resource "aws_iam_role_policy_attachment" "process_transactions" {
  role       = aws_iam_role.process_transactions.name 
  policy_arn = aws_iam_policy.process_transactions.arn 
}

# Attach the AWSLambdaBasicExecutionRole to the Lambda Role
resource "aws_iam_role_policy_attachment" "process_transactions_lambda_basic_execution" {
  role       = aws_iam_role.process_transactions.name 
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}