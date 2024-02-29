resource "aws_s3_bucket" "fetch_blocks" {
  bucket = "zkwilly-${var.env}-fetch-blocks" # Must be globally unique
}

resource "aws_s3_bucket_versioning" "fetch_blocks" {
  bucket = aws_s3_bucket.fetch_blocks.id
  versioning_configuration {
    status = "Enabled"
  }
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lambda_permission" "fetch_blocks_s3_trigger" {
  statement_id  = "AllowExecutionFromS3" 
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fetch_transactions.function_name 
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.fetch_blocks.arn 
}

resource "aws_s3_bucket_notification" "fetch_blocks_notification" {
  bucket = "${var.project}-${var.env}-fetch-blocks"  

  lambda_function {
    lambda_function_arn = aws_lambda_function.fetch_transactions.arn
    events              = ["s3:ObjectCreated:*"] 
    filter_suffix       = ".json"                  
  }

  depends_on = [aws_lambda_permission.fetch_blocks_s3_trigger]
}

resource "aws_s3_bucket" "fetch_transactions" {
  bucket = "zkwilly-${var.env}-fetch-transactions" # Must be globally unique
}

resource "aws_s3_bucket_versioning" "fetch_transactions" {
  bucket = aws_s3_bucket.fetch_transactions.id
  versioning_configuration {
    status = "Enabled"
  }
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lambda_permission" "fetch_transactions_s3_trigger" {
  statement_id  = "AllowExecutionFromS3" 
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_transactions.function_name 
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.fetch_transactions.arn 
}

resource "aws_s3_bucket_notification" "fetch_transactions_notification" {
  bucket = "${var.project}-${var.env}-fetch-transactions"  

  lambda_function {
    lambda_function_arn = aws_lambda_function.process_transactions.arn
    events              = ["s3:ObjectCreated:*"] 
    filter_suffix       = ".json"                  
  }

  depends_on = [aws_lambda_permission.fetch_transactions_s3_trigger]
}